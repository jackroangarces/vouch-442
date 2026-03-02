import { useEffect, useMemo, useState } from "react";
import { arrayRemove, arrayUnion, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import type { RestaurantImage } from "../types/restaurant";

type Props = {
  restaurantId: string;
  onClose: () => void;
};

export default function RestaurantImagesModal({ restaurantId, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<RestaurantImage[]>([]);
  const [link, setLink] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const restaurantDocRef = useMemo(() => doc(db, "restaurants", restaurantId), [restaurantId]);

  function isDirectImageUrl(url: string) {
    return /^https?:\/\/.+\.(png|jpg|jpeg|gif|webp|avif)(\?.*)?$/i.test(url);
  }

  function normalizeImgurUrl(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return "";

    try {
      const u = new URL(trimmed);
      const host = u.hostname.replace(/^www\./, "");

      if (host === "i.imgur.com") return trimmed;

      if (host === "imgur.com" || host === "m.imgur.com") {
        const path = u.pathname.replace(/^\/+/, "");
        if (!path || path.startsWith("a/") || path.startsWith("gallery/")) return "";

        const id = path.split("/")[0];
        if (!id) return "";

        if (/\.(png|jpg|jpeg|gif|webp|avif)$/i.test(id)) return `https://i.imgur.com/${id}`;
        return `https://i.imgur.com/${id}.jpg`;
      }

      return trimmed;
    } catch {
      return trimmed;
    }
  }

  function makeExternalId(url: string) {
    return `external:${restaurantId}:${Date.now()}:${Math.random().toString(16).slice(2)}:${url}`;
  }

  function clearInput() {
    setLink("");
    setPreviewUrl("");
  }

  async function loadImages() {
    setLoading(true);
    try {
      const snap = await getDoc(restaurantDocRef);
      const raw = snap.exists() ? (snap.data() as any).images : [];
      setImages(Array.isArray(raw) ? raw : []);
    } finally {
      setLoading(false);
    }
  }

  async function verifyImageLoads(url: string) {
    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      const timeout = window.setTimeout(() => reject(new Error("timeout")), 8000);

      img.onload = () => {
        window.clearTimeout(timeout);
        resolve();
      };

      img.onerror = () => {
        window.clearTimeout(timeout);
        reject(new Error("load failed"));
      };

      img.referrerPolicy = "no-referrer";
      img.src = url;
    });
  }

  async function uploadLink() {
    const normalized = normalizeImgurUrl(link);

    if (!normalized || !isDirectImageUrl(normalized)) {
      alert("Error uploading image");
      return;
    }

    setSaving(true);

    try {
      await verifyImageLoads(normalized);

      const image: RestaurantImage = {
        url: normalized,
        path: makeExternalId(normalized),
      };

      await setDoc(restaurantDocRef, { images: arrayUnion(image) }, { merge: true });

      clearInput();
      await loadImages();
    } catch (err) {
      console.error(err);
      alert("Error uploading image");
    } finally {
      setSaving(false);
    }
  }

  async function removeImage(img: RestaurantImage) {
    try {
      await setDoc(restaurantDocRef, { images: arrayRemove(img) }, { merge: true });
      await loadImages();
    } catch (err) {
      console.error(err);
      alert("Error uploading image");
    }
  }

  function handleLinkChange(v: string) {
    setLink(v);

    const normalized = normalizeImgurUrl(v);
    setPreviewUrl(normalized && isDirectImageUrl(normalized) ? normalized : "");
  }

  useEffect(() => {
    void loadImages();
  }, [restaurantId]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Images / Remove Images</h2>
          <button type="button" className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="image-upload-row">
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              Imgur direct image link
              <input
                type="url"
                value={link}
                onChange={(e) => handleLinkChange(e.target.value)}
                placeholder="https://i.imgur.com/xxxxx.jpg"
              />
            </label>

            <button
              type="button"
              className="auth-submit image-upload-btn"
              onClick={() => void uploadLink()}
              disabled={saving || !link.trim()}
            >
              {saving ? "Uploading…" : "Upload"}
            </button>
          </div>

          {previewUrl && (
            <div className="image-preview">
              <p style={{ margin: 0, opacity: 0.75 }}>Preview</p>
              <img src={previewUrl} alt="Preview" />
            </div>
          )}

          {loading ? (
            <p style={{ margin: 0, opacity: 0.7 }}>Loading…</p>
          ) : images.length === 0 ? (
            <p className="images-empty">No images found</p>
          ) : (
            <div className="images-grid">
              {images.map((img) => (
                <div key={img.path ?? img.url} className="images-grid-item">
                  <img src={img.url} alt="Restaurant" />
                  <button type="button" className="images-remove" onClick={() => void removeImage(img)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}