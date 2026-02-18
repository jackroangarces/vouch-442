# Unit Testing (Automated)

## Purpose: Validate individual logic components in isolation

**Applied To**
- Account validation logic
- Sign-in authentication
- Review submission logic
- Vibe value range enforcement (1–5)
- Polar chart average calculation
- Access restriction logic

**When Executed**
- During feature development before pull request

# Manual Acceptance Testing

## Purpose: Validate that core user goals are achievable and match product intent

**Applied To**
- Account validation
- Login
- Writing a review
- Polar chart accuracy
- Navigation usability
- Search functionality

**When Executed**
- Executed in staging before product release

# Performance Testing

## Purpose: Ensure responsiveness 

**Applied To**
- Polar chart loading times
- Page loading times
- Review submission times

**When Executed**
- Before deployment of major updates and during stage testing when needed

# Load Testing

## Purpose: Esure stability under high traffic and usage

**Applied To**
- Concurrent sign ups
- Concurrent log ins
- Concurrent review submissions
- High volume search queries

**When Executed**
- Before deployment of major updates and staging with simulated high traffic


# Testing process & Scheduling

**Step 1: Feature Development**
- Developer codes feature in personal branch
- Writes unit tests for feature
- Tests locally (Local developer Environment)

**Step 2: Pull Request**
- Pull request opened to main branch
- Automated tests run:
    - Unit tests
    - Integration tests
- merge blocked if fail tests

**Step 3: Merge to Main**
- After code review approval
- Auto-deploy to staging

**Step 4: Acceptance Testing (Staging)**
- Produce Designer execute acceptace tests
- log bugs if discovered

**Step 5: Production Deployment**
- After approval only
- Final test right after deployment


# Test Environments

## Developer Environment (Locally)
- Code runs on developer's computer (localhost)
- Use test Firebase database
- Used for:
    - Unit tests
    - Early integration tests

## Continuous Integration Environment
- Temporary build triggered by pull request
- Run automated unit and integration tests
- block merge if fails

## Staging Environment
- Hosted server mirroring production
- Uses test database scheme
- Used for:
    - Acceptance testing
    - Cross-browser testing
    - Performance testing

## Production Evironment
- Live system
- Only stable code deployed

# Browsers & Devices Tested

## Desktop:
- Chrome
- Safari
- Firefox
- Edge

## Mobile:
- IPhone (Safari)
- Android (Chrome)

## Screen Sizes:
- Desktop
- Mobile
- Tablet

# Failure Protocol & Defect Management

## Reporting a bug: Tester creates GitHub Issue
- Title
- Environment (Dev/Staging/Prod)
- Browser/Device
- Steps to reproduce
- Expected result
- Actual result
- Proof (Screenshot/video)
- Severity Level

## Severity Levels
- Critical: Application unusable/Security risk
- High: Core functionality broken
- Medium: Parital functionality issue
- Low: Cosmetic issue

## Assignments
- Bugs reviewed
- Severity confirmed
- Developer/developers assigned
- Fix created in developer branch
- Run automated tests
- Verify in staging
- Merge after approval

# Acceptance Testing Script

## Test Case #1: Setup Firestore

**Validates:** Database connection and persistance

**Context:** App running in staging

**Actions:**
- Create new user
- Submit review
- Refresh Page

**Expected Outcome:**
- Data persists
- No database errors

## Test Case #2: Account Creation

**Validates:** User can register successfully

**Context:** New user visting platform

**Actions:**
- Click "Sign Up"
- Enter valid email + Password
- Submit

**Expected Outcome:**
- Account created
- User logged in
- Redirect to homepage

## Test Case #3: Sign in logic

**Validates:** Registered user login

**Context:** Existing user

**Actions:**
- Enter credentials
- Submit

**Expected Outcome:**
- Login successful
- Access granted

## Test Case #4: User Flow Logic

**Validates:** Access restrictions

**Context:** Logged out user

**Actions:**
- Navigate to restaurant page
- Click "Log in to review"

**Expected Outcome:**
- Review form blocked
- Redirect to login

## Test Case #5: Build Polar Chart

**Validates:** Chart renders correctly

**Context:** Restaurant page loaded

**Actions:**
- Open restaurant page 

**Expected Outcome:**
- Polar chart visible
- All 6 axes labeled
- Area within polar chart perimeters

## Test Case #6: Polar Chart Functionality

**Validates:** Chart updates with new reviews

**Context:** Existing reviews present

**Actions:**
- Submit a review
- Refresh page

**Expected Outcome:**
- Chart averages updated

## Test Case #7: Vibe Logic

**Validates:** Accurate average calculations

**Context:** Multiple reviews exist

**Actions:**
- Submit review with known values

**Expected Outcome:**
- Averages calculated correctly
- Values remain 1-5

## Test Case #8: Navigation Bar

**Validates:** Navigation works correctly

**Context:** User on page with existing navigation bar

**Actions:**
- Click on each navigation link

**Expected Outcome:**
- Correct page loads
- Log in status persists

## Test Case #9: Account Rendering

**Validates:** Account page displays correct data

**Context:** Logged in user

**Actions:**
- Open account page by clicking username

**Expected Outcome:**
- User info displayed
- Reviews displayed correctly

## Test Case #10: Search implementation

**Validates:** Restaurant search works

**Context:** There are restaurants listed in the app and user is on homepage

**Actions:**
- Enter restaurant name
- Submit search

**Expected Outcome:**
- Correct results displayed
- Clicking result opens correct restaurant page

## Test Case #11: Review Popup

**Validates:** Review interface opens correctly

**Context:** Logged in user

**Actions:**
- Click "Write a review"

**Expected Outcome:**
- Review pop up appears
- All required fields visible

## Test Case #12: Submission Logic

**Validates:** Review saves correctly

**Context:** Completed review form

**Actions:**
- Click submit

**Expected Outcome:**
- Review saved
- Visible on page
- No duplicates

## Test Case #13: Validation

**Validates:** Invalid inputs blocked

**Context:** Logged in user

**Actions:**
- Slider cannot be outside 1-5 range
- Leave any field blank
- Submit

**Expected Outcome:**
- User cannot click submit button
- Submission prevented

## Test Case #14: Submission feedback

**Validates:** Confirmation shown after submission

**Context:** Valid review

**Actions:**
- Fill in fields for a review
- Submit reivew

**Expected Outcome:**
- Success message displays
- Form closes

## Test Case #15: Full End To End Regression

**Validates:** Entire workflow works together

**Context:** Fresh staging session

**Actions:**
- Sign up
- Log out
- Log in
- Search restaurant
- Submit review
- Verify chart updates

**Expected Outcome:**
- No errors
- Data persists
- Chart accurate
- Access control enforced

## Test Case #16: Account Settings

**Validates:** User can change account password

**Context:** User is logged in and on account page

**Actions:**
- Click "Account Settings"
- Fill in reqiured fields
- Click "Apply Changes"

**Expected Outcome:**
- Password change pop up displays correctly
- User is able to apply a new password
- User is able to log in with new password

## Test Case #17: Account Settings

**Validates:** Invalid inputs blocked

**Context:** User is logged in and on account page

**Actions:**
- Click "Account Settings"
- Fill in same password into new password
- Click "Apply Changes"

**Expected Outcome:**
- Error message displays correctly
- Blocked from applying changes

## Test Case #18: Restaurant Scroll

**Validates:** UI scrolling behavior for restaurant list

**Context:** App running in staging

**Actions:**
- Scroll down list of restaurants
- Ensure all restaurants loads dynamically as user scrolls

**Expected Outcome:**
- Restaurants continue loading without IU glitches
- No blank spaces or broken elements

## Test Case #19: Search filtering

**Validates:** Search filter functionality

**Context:** App running in staging, user on home page

**Actions:**
- Apply filters
- Submit search

**Expected Outcome:**
- Search result should match selected filters
- No errors or empty lists unless no matches exist

## Test Case #20: Top Restaurants

**Validates:** Display of top restaurants

**Context:** App is running in staging, user is logged in

**Actions:**
- Navigate to user profile
- Verify correct restaurants appear in correct order

**Expected Outcome:**
- Top restaurants are displayed in correct order

## Test Case #21: Top Cuisines

**Validates:** Display of top cuisines

**Context:** App is running in staging, user is logged in

**Actions:**
- Navigate to user profile
- Verify correct cuisines appear in correct order

**Expected Outcome:**
- Top cuisines are displayed in correct order


## Test Case #22: Profile Views

**Validates:** Profile view tracking and display

**Context:** App running in staging, user not logged in

**Actions:**
- Open user profile
- Click on user profile

**Expected Outcome:**
- redirect to user profile page


## Test Case #23: Business Pop up

**Validates:** Business pop up UI and fucntionality

**Context:** User logged in

**Actions:**
- Click "Add a business"
- fill in details
- hit submit

**Expected Outcome:**
- Pop up opens and closes without errors
- submitted data persists in backend


## Test Case #24: Image Uploading

**Validates:** Upload functionality for images

**Context:** User is logged in business dashboard

**Actions:**
- Click "add image"
- Select an image from local device
- Submit/upload
- Refresh page

**Expected Outcome:**
- Image is uploaded and displayed correctly
- No database errors or broken images


## Test Case #25: UX Polish

**Validates:** UI/UX improvements and consistency

**Context:** App running in staging

**Actions:**
- Navigate through app screens
- interact with buttons and links
- Check alignment, font consistancy, spacing, and responsiveness

**Expected Outcome:**
- UI elements render properly
- No visual glitches or unusual behavior


## Test Case #26: Empty States

**Validates:** Empty state behavior for various sections

**Context:** App running in staging

**Actions:**
- Open sections with no data
- Observe messages or placeholders

**Expected Outcome:**
- Clear and user friendly empty state messages appear
- no broken layouts