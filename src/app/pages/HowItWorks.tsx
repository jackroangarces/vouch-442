import { Link } from "react-router-dom";

export default function HowItWorks() {
  return (
    <div className="main">
      <h1>How it works</h1>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: "1.1rem", opacity: 0.9, marginBottom: 8 }}>Our purpose</h2>
        <p style={{ margin: 0, maxWidth: 640, lineHeight: 1.6 }}>
          Vouch helps you discover small and independently owned restaurants based on{" "}
          <strong>experience and fit</strong>, not just popularity or ad spend. We highlight each
          place’s vibe and most recent review so you can see what it’s really like, and so great local
          spots get a fair shot at being found.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: "1.1rem", opacity: 0.9, marginBottom: 12 }}>Using the app</h2>
        <ol style={{ margin: 0, paddingLeft: 20, maxWidth: 640, lineHeight: 1.7 }}>
          <li>
            <strong>Browse restaurants</strong>: On the home page, use the search box to filter by
            name, description, or address. You can sort by nearest or farthest if you allow location.
          </li>
          <li>
            <strong>Open a restaurant</strong>: Click a restaurant card to open its detail page.
            There you’ll see its name, a short description, and the <strong>latest review</strong> so
            you know what to expect right now.
          </li>
          <li>
            <strong>Check the vibe</strong>: Each restaurant has a six-axis “vibe” chart (Food,
            Ambience, Service, Price, Sustainability, Location). Use the legend to see what low vs
            high means for each category.
          </li>
          <li>
            <strong>Write a review</strong>: Log in, then click <strong>“Write a review”</strong> on
            the restaurant page. Add your rating, written review, and set your vibe scores. Your
            review helps others and gives that business more visibility.
          </li>
        </ol>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: "1.1rem", opacity: 0.9, marginBottom: 12 }}>How to make a review</h2>
        <ol style={{ margin: 0, paddingLeft: 20, maxWidth: 640, lineHeight: 1.7 }}>
          <li>
            <strong>Log in</strong>: Use the “Login” link in the top bar (or sign up if you’re new).
          </li>
          <li>
            <strong>Go to a restaurant</strong>: From the home page, click the restaurant you
            want to review.
          </li>
          <li>
            <strong>Click “Write a review”</strong>: On the restaurant page, click the button below
            the restaurant name.
          </li>
          <li>
            <strong>Fill out the form</strong>: Enter your written review, star rating (1–5), and
            adjust the vibe sliders (Food, Ambience, Service, Price, Sustainability, Location) to
            match your experience.
          </li>
          <li>
            <strong>Submit</strong>: Click the submit button. Your review will appear as the
            “latest review” for that restaurant and feed into its vibe chart.
          </li>
        </ol>
      </section>

      <p style={{ marginTop: 24, opacity: 0.8 }}>
        <Link to="/">← Back to Restaurants</Link>
      </p>
    </div>
  );
}
