Requirements Specification: Vouch

**Navigation (N)** 
- N1. Every page contains an easily accessible navigation bar. 

When a user visits any page, the navigation bar will contain:
- N2. A logo of Vouch that links to the home screen.
- N3: When a user views the navigation bar a search input field will appear for restaurant discovery. 
- N4. A profile icon or a user’s profile picture linking to the user's settings. 

When an authenticated user (Standard User) views the navigation bar:
- N5. The profile menu must display a "Log Out" button.
- N6. The profile menu must display an "Add A Business" button that initiates restaurant onboarding.
- N7. The profile menu must display a "Delete Account" button.

When an authenticated user (Restaurant Owner) views the navigation bar:
- N8. The navigation bar displays a "Restaurant Account" link that redirects the user to the business dashboard.
- N9. The nav bar must display an option to edit “Restaurant.” 
- N10. The profile menu must display a "Log Out" link.

When an unauthenticated user (New Visitor) views the navigation bar:
- N11. The navigation bar displays a link to the landing page for account selection.

**Search and Discovery (S)**

When a user is on the Home Screen:
- S1. The results list displays a vertical scroll of restaurant cards
- S2. Clicking the search icon refreshes the results list based on the user’s search bar input.
- S3. If no restaurants match the search query, the results list displays the text "No relevant results found”.
- S4. If there is nothing in the search bar, the filtering defaults to sorting by closest to the user’s location.
- S5. There is a six-axis Polar Chart to the right of the vertical scroll.
- S6. The Polar Chart will show a value of zero in each category when the page is first loaded or reloaded.
- S7. When the user clicks and drags any of the axes on the Polar Chart, the axis moves with the cursor and pushes the integer values between 1 and 5.
- S8. When the user releases their click after moving a Polar Chart axis, the results list is reloaded with new restaurants reflecting the chart.

**Vibe Logic & Profiles (V)** 

When the user is in the restaurant and in a public profile view section, and the user views a restaurant or user profile by clicking on it:
- V1. The system displays a six-axis Polar Chart.
- V2. The restaurant Polar Chart shape represents the aggregate average of user ratings across all axes.
- V3. The "What's Their Vibe?" chart displays the mean coordinate values calculated from the user's "Top Recs" list

When an unauthenticated user visits a profile by clicking on the restaurant or user profile:
- V4. The system displays the profile name and location without a login prompt.
- V5. The system displays the public Vibe Chart.

**Profile Editing (P)**

When an authenticated user views "Your Profile":
- P1. The "Top Restaurants" section lists the three highest-rated restaurants from the user's history that are four stars or higher.
- P2. If multiple restaurants have the same high rating, it will be ordered by recency.
- P3. If a user has reviewed one restaurant, that restaurant will appear as the top restaurant if it is rated four stars or higher.
- P4. If a user has reviewed two restaurants, those restaurants will appear in the top restaurants if they are rated four stars or higher.
- P5. The "Top Cuisines" section lists the three most frequent cuisine types from the user's reviews.
- P6. If there is a tie, it will be ordered alphabetically.
- P7. The Vibe Chart will adjust based on the Vibe Chart of restaurants reviewed by the user. It will average out the scores in each category to show the general vibe of each user.
- P8: If the user has no reviews that are rated four stars or higher, the “Top Restaurants” section displays the text “No top recommendations yet”.

**Account Management (M)** 

When an authenticated user clicks an editable field in Account Settings:
- M1. Clicking the "Username" box displays the "Change Username" pop-up.
- M2. If an invalid username is entered, an invalid username error alert will appear.
- M3. Clicking the "Location" box displays the "Change Location" pop-up.
- M4. If an invalid location is entered, an invalid location error alert will appear.
- M5. Clicking the "Password" box displays the "Change Password" pop-up.
- M6. If an invalid password is entered, an invalid password error alert will appear.
- M7. Clicking "Save Changes" must update the profile data and close the pop-up.
- M8. Clicking "Cancel" must close the pop-up without updating the field.
- M9.1. Clicking "Log Out" terminates the session.
- M9.2.  Clicking “Log Out” shall redirect the user to the landing page.
- M10.1. When the “Delete Account” button is clicked, the system displays a confirmation pop-up 
- M10.2. After the user confirms, the system shall remove the account
- M10.3. When the account is removed, the user should then be redirected to the landing page
- M11. Clicking the “Add A Business” button displays a pop-up containing the fields to create a new business account.

**Error Handling (E)** 

When a user attempts to create or update an account:
- E1. When a user submits an account create/update form with a username that is invalid or already in use, the system shows an alert that says "Invalid username entered".
- E2. When a user submits an account create/update form with a location the system does not recognize, the system shows an alert that says "Invalid Location entered".
- E3. When a user submits a password change where the new password matches the current password, the system shows an alert that says "Revised previous password, please use a new password".
- E4. When a user attempts to upload an image and the upload fails, the system shows an alert that says "Error uploading image".
- E5. When a restaurant owner submits a restaurant name that the system rejects, the system shall display an alert that says "Invalid Restaurant Name".
- E6. When the user opens the Images/Remove Images popup and there are no uploaded images the system displays the message “No images found”.

**Non-Functional Requirements (NF)**

- NF1. Then, the user clicks the search icon on the Home Screen,and  the results list T must refresh within 2.0 seconds.
- NF2. When any user-initiated input action completes successfully, the UI shows an immediate (within 2.0 seconds) visible confirmation that the action has been completed.
