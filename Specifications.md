Problem:
Small and local businesses often struggle to gain visibility and customer traction compared to large chains and highly reviewed venues, even when they offer equally compelling or more authentic experiences. Dominant discovery platforms (like Google Maps and Yelp) prioritize businesses with large volumes of reviews and high ratings, meaning that well-known or heavily marketed places tend to appear first in search results and recommendations. This creates a feedback loop where popular businesses get more exposure while lesser-known neighbors get overlooked, limiting the economic opportunity for local entrepreneurs who can’t compete with the review volume and marketing power of national chains. At the same time, people who want authentic experiences in their communities or when traveling (like mom-and-pop cafés, family-run bookstores, unique local eateries, etc.) often find themselves funnelled toward the same familiar options. With over 80% of U.S. consumers using Google reviews to evaluate local businesses and nearly half using Yelp, a strong presence on these platforms is effectively required for discovery and foot traffic, but many local businesses lack the review volume or visibility to rise to the top of these results. 

Source: https://grabon.com/blog/local-shopping-statistics/

Solution Summary:
We offer a streamlined application that supports decent work and local economic growth by giving the opportunity for small businesses to get discovered for what makes them unique. Our app supports both local owners and consumers alike by exclusively featuring small, under-the-radar businesses and helping people discover authentic experiences. By having our recommendation system based on desired vibe and experience rather than popularity, we will promote a more inclusive and sustainable local economy.

Design:

Wireframes:
https://docs.google.com/document/d/1PWo5RZaWCja5QgtZkfv_wgV0iCNzobgPekkFLdO-GUI/edit?usp=sharing

Global elements
Header: Local Lens logo (home), search bar, Saved, Profile.
 Active filters bar: removable filter chips + “Clear all”.
 Principle: show only small/local spots; sort by “best match” to selected experiences (not review count).
 Note: keep interactions minimal—no accounts required, no complex personalization.

Screen 1: Landing & Account Selection (Fig. 1)
Purpose: Entry point for users to choose between a personal or restaurant account 
Layout: Two modules, either User Account or Restaurant Account 
Actins: Four main buttons 
Create a User Account
Log in User Account
Create a Restaurant Account
Login Restaurant Account
Visuals: Placeholder image boxes for both actual user and restaurant sections to provide context 

Screen 2: User Account Creation Pop-up (Fig. 2)
Purpose: Receive basic user information, such as user credentials and geographic data, for personalization 
	Fields: Input boxes for Username, Password, and Location
	Validation: Includes error handling for “Invalid username entered” and “Invalid Location entered.” (Fig. 2.1-2.2)
	Actions: “Cancel” to return or “Create Account” to submit 

Screen 3: Restaurant Onboarding (Multi-Step) (Fig. 3)
Purpose: Gather business details and pictures for the requirement profile
Initial Info: Fields for Username, Password, and Name 
Other Info: Fields for location, and a text area for description of the restaurant (Fig. 3.2)
Media Upload: A pop-up specifically for Image Upload, including a “Browse” button that lets the user go through their saved pictures and a preview for images that are uploaded (Fig. 3.3)
Validation: Error alerts for “invalid name”, “invalid Location”, and “Error uploading image” (Fig. 3.1)

Screen 4: User Home & Search (Fig. 4)
Purpose: Main exploration interface for finding restaurants 
	Layout: Search bar (top) + Results list (left) + Large Polar Chart (Vibe Chart) (right)
	Results List: Vertical scroll of restaurant cards showcasing Name and Location summary
	Empty State: “No results found” message shows up when the user’s criteria do not match anything (Fig. 4.1)
	Navigation: Profile icon in the top right corner for changing personal settings

Screen 5: Restaurant & User Profile (Public View) (Fig. 5)
Purpose: App user can view detail “Vibes” and recommendations of other users
Restaurant View: Displays the restaurant name, a photo gallery, description, and the signature polar chart
User View: Shows Top Recs such as top restaurants and top cuisines, and a Whats Their Vibe that shows a polar chart  (Fig. 5.1)

Screen 6: Account Settings and Profile Management (Fig. 6)
Purpose: Allow users and owners to change/update their information 
	Modules: Sections for Account Settings (Username, Password, Location) and Profile Details 
	Editing: Clicking on various boxes changes pop-ups for “Change Username”, “Change Password,” or “Change Location.” 
	Management Actions: These are used for adding a business, logging out, and deletingan  account (Fig 6.1)
	Media Management (Restaurant): Restaurants will have pop-ups to add images or remove images with a grid view of current uploads (Fig. 6.2)

