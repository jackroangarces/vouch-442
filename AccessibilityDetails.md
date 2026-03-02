# Addressing Accessibility

## Purpose: Keep record of any changes to assist with better accessibility

**Applied To**
- Profile Page
- Home Page
- Login Page

## Profile page

**Issues**
- Not enough contrast with buttons on profile page

**What we changed**
In the profile page we had a contrast problem specifically with the “Account Settings” button. In the old code, we had a darker purple for the button which made it hard to see when put on the dark grey background we used for the widget. The new change altered the original dark purple to a lighter purple, giving it more contrast with the dark grey background. With that, the text “Account Settings” was then altered to black instead of white to provide enough contrast with the lighter color of the button itself. The same changes were made for the business dashboard button. The button itself was altered to a lighter purple to provide contrast with the dark grey background of the widget.

## Home Page

**Issues**
- Not enough contrast with buttons on navigation bar
- Search bar in navigation bar has no associated label elements
- Search bar in main page has no associated label elements
- Sort by box has no assiciated label elements

**What we changed**
In the navigation bar, the login/logout buttons and the search button had poor contrast with the background color of the navigation bar. To fix this, we changed the colors of the buttons just like we did in the profile page. Changing the button colors to be lighter and the text to black provides enough contrast so that it can be clearly read by all potential users.

The other three issues had to do with label elements. In our original design, we had no label elements so screen readers were not able to read out the input boxes. to fix this issue I added label elements to the two search bars and the drop down. On line 30 in NavBar.tsx, I added a label element called Search Restaurant and added a visually-hidden class. Along with that, I changed the input to have the correct id as well. Following that, I did the same thing for the search bar on the main page and the dropdown menu, adding the label elements to Home.tsx on lines 266 and 211. I also added a visually-hidden class in style.css that hides the label elements so they can't be seen, making the website much more asthetically pleasing. 


## Login Page

**Issues**
- Not enough contrast with buttons for login widget
- Not enough contrast with widget from background
- Not enough contrast with text and input boxes within login widget

**What we changed**
We made a lot of color changes and alterations here to ensure that there was enough contrast on the page for all users. Because the pop-up/widget itself didn't have much contrast with the grey background, I changed the color from a grey to black. This also made it so that the input boxes stood out as they were previously the same color and the pop-up. Because the pop-up changed to black, I had to change the input labels for "email", "password", "Don't have an account", and "login" to white so they were visible. Lastly, the "Log In" button at the bottom was darkened along with the words "sign up" at the bottom to help them stand out from the black background.


# Performance improvement

**Applied To**
- Home Page

## Home Page

**Issues**
- Logo too big for size used in website
- Png not discoverable from HTML immediately
- does not avoid lazy loading

**What we changed**
To fix this, I first decreased the size of the actual png of the logo so that it wouldn't take too long to download and eventually load, improving the overall performance. This wasn't enough though. I also placed the image directly in the HTML markup instead of doing it directly in javascript later. These changes were made within Navbar.tsx starting at line 20. By putting the relative path to the image in the HTML markup and shrinking the overall size of the image and how we show the image, the performace overall improved.