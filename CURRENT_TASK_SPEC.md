<USER_REQUEST>
continue You are a PRINCIPAL PRODUCT DESIGNER, UX ARCHITECT and SENIOR FRONTEND ENGINEER.

You are working on an existing Avanthi Cricket Carnival (ACC) Player Auction Portal.

IMPORTANT:
Do not replace the project with a generic template.
Do not build another ordinary college dashboard.
Do not copy Razorpay branding, logo, exact visual assets, or proprietary layouts.

Instead, use the QUALITY BAR of a modern premium fintech product:
- extremely strong visual hierarchy
- sophisticated typography
- restrained surfaces
- excellent whitespace
- clear states
- precise interactions
- responsive behavior
- meaningful motion
- high information density where required
- minimal visual noise
- operational clarity

Think:

PREMIUM FINTECH PRODUCT
+
LIVE SPORTS AUCTION
+
TRADING TERMINAL
+
MODERN CRICKET BROADCAST

The attached ACC Hackathon Problem Statement is the source of truth.

The handwritten change sheet is also authoritative for the requested login structure.

========================================================
1. PRODUCT IDENTITY
========================================================

Brand:

AVANTHI CRICKET CARNIVAL

Product:

PLAYER AUCTION PORTAL

Short:

ACC

Edition:

ACC 2026

Position the product as a serious event operating platform, not a student registration website.

The current screenshot already contains:
- Public View
- Live Auction
- Franchise Terminal
- Registration
- Admin Console
- Projector

Preserve that overall information architecture where useful, but redesign the navigation and authentication flow around actual user roles.

========================================================
2. CORE ACCESS MODEL
========================================================

There are FIVE user experiences:

1. PUBLIC
2. PLAYER
3. FRANCHISE
4. ADMIN / HANDLER
5. SUPER ADMIN

PUBLIC:
No login.

PLAYER:
Login required.

FRANCHISE:
Login required.

ADMIN / HANDLER:
Login required.

SUPER ADMIN:
Login required.

Do not expose internal admin/franchise/player controls through the public interface.

========================================================
3. ROLE DEFINITIONS
========================================================

SUPER ADMIN
The tournament organiser.

One account.

Full control over:
- tournament settings
- player verification
- payment marking
- franchise approval
- captain / vice-captain assignments
- referred-player verification
- auction control
- draw mode
- skip
- pause
- resume
- hammer
- bid on behalf
- direct assignment
- undo
- bucket relaxation
- scouting
- auto-allotment
- audit
- exports
- account management

ADMIN / HANDLER
Operational auction account.

Can:
- run auction
- operate lots
- manage bidding flow
- skip
- pause
- resume
- hammer where authorized
- perform normal auction operations

Cannot:
- change tournament settings
- delete franchises
- perform Super Admin-only configuration changes

The backend must enforce these permissions.

Do not rely on hiding buttons in the frontend.

FRANCHISE
One of 11 franchise accounts.

Each franchise has:
- team identity
- faculty coordinator
- captain
- optional second authorized captain login
- squad
- purse
- bucket requirements
- bidding privileges

The faculty coordinator mobile is the primary franchise login.

The captain mobile is an optional second authorized login on the SAME franchise account.

PLAYER
A student.

Can:
- register
- log in
- maintain own profile
- edit permitted details
- manage cricket information
- manage CricHeroes information
- see their own registration state

PUBLIC
No login.

Read-only.

Can see:
- registered players
- photographs
- academic information
- skills
- statistics
- base price
- franchises
- coordinators
- captains
- squads
- live auction state

Never show public mobile numbers.

========================================================
4. LOGIN EXPERIENCE
========================================================

Do NOT create five completely unrelated login pages.

Create ONE premium authentication entry:

/login

The login screen should identify the user's role before authentication or after account recognition.

Use a polished role selector:

CONTINUE AS

[ SUPER ADMIN ]
[ ADMIN / HANDLER ]
[ FRANCHISE ]
[ PLAYER ]

PUBLIC does not appear as a login role.

Provide a separate:

CONTINUE AS PUBLIC

link.

Do not make the login page visually crowded.

========================================================
5. PREMIUM LOGIN DESIGN
========================================================

Design the login page like a premium modern fintech authentication experience.

Desktop:

LEFT SIDE:
ACC branding / identity / short message

RIGHT SIDE:
authentication card

Example:

AVANTHI
CRICKET
CARNIVAL

PLAYER AUCTION 2026

The official operating platform for
registration, squad management and
live player auction.

--------------------------------

SIGN IN TO ACC

Continue as

[ Franchise ]

Mobile

[ Operator ]

Then:

MOBILE NUMBER
[ +91 __________ ]

[ SEND OTP ]

or appropriate secure authentication method.

At bottom:

Public Viewer
No account required → View live auction

Do not use giant marketing illustrations.

Use elegant typography, subtle geometry, soft lighting and precise spacing.

========================================================
6. AUTHENTICATION STATES
========================================================

The login UI must have states:

DEFAULT

ROLE_SELECTED

ENTER_CREDENTIAL

OTP_SENT

VERIFYING

AUTHENTICATED

INVALID_CREDENTIAL

EXPIRED_CODE

LOCKED

SESSION_EXPIRED

NETWORK_ERROR

SUCCESS

Use meaningful feedback.

Example:

VERIFYING YOUR ACCESS…

CONNECTED

AUTHENTICATED AS:
TITANS

Then transition to the correct dashboard.

========================================================
7. FRANCHISE LOGIN
========================================================

Franchise login has TWO authorized identities attached to one franchise account:

FACULTY COORDINATOR
PRIMARY LOGIN

CAPTAIN
OPTIONAL SECOND LOGIN

Both authenticate into the same franchise.

After login:

identify the user separately:

Signed in as
FACULTY COORDINATOR

Franchise:
TITANS

or

Signed in as
CAPTAIN

Franchise:
TITANS

Both see the same franchise squad/purse/bidding state.

Do not create two separate team accounts.

========================================================
8. PLAYER LOGIN
========================================================

Player login should feel lighter and friendlier than admin login.

Header:

PLAYER PORTAL

Subheading:

Manage your ACC profile and auction information.

Login with:

mobile / approved credential

After authentication:

PLAYER HOME

show:

Profile completion
Academic profile
Cricket profile
CricHeroes status
Registration status
Payment status
Auction eligibility

Example:

PROFILE
92% COMPLETE

CRICHEROES
PENDING

PAYMENT
VERIFIED

AUCTION STATUS
ELIGIBLE

========================================================
9. SUPER ADMIN DASHBOARD
========================================================

After login:

/admin

Create a high-end operations console.

Header:

ACC 2026
SUPER ADMIN

Live system state:

● SYSTEM ONLINE
● AUCTION IDLE

Main metrics:

REGISTERED PLAYERS
PAID PLAYERS
AUCTIONABLE
FRANCHISES
CURRENT LOT
AUCTION ROUND

Navigation:

Overview
Registrations
Players
Franchises
Referrals
Auction Control
Buckets
Round 2
Undo / Corrections
Audit Log
Exports
Settings

Use a compact sidebar on desktop.

Use bottom navigation or a drawer on small screens.

========================================================
10. ADMIN / HANDLER DASHBOARD
========================================================

Use the same visual system but reduce permissions.

Header:

ACC 2026
AUCTION HANDLER

Show:

CURRENT LOT
TIMER
CURRENT BID
HIGHEST BIDDER
FRANCHISE STATUS
SCARCITY

Controls:

START
PAUSE
RESUME
SKIP
HAMMER
DRAW NEXT

Do not show destructive configuration actions that this role cannot perform.

If the user navigates to a restricted route manually:

show:

ACCESS RESTRICTED

This action requires Super Admin privileges.

========================================================
11. FRANCHISE TERMINAL
========================================================

The franchise interface is mobile-first.

This is not a normal dashboard.

It should feel like a financial trading interface.

Top:

TITANS

● CONNECTED

PURSE
620

MAX LEGAL BID
440

SQUAD
15 / 22

Current lot:

PLAYER PHOTO

ARJUN KUMAR

ALL-ROUNDER

B.Tech ECE · Year 3 · B3

CURRENT BID
180

HIGHEST BIDDER
TITANS

TIMER
17

Then the main action:

[ BID 200 ]

[ PASS ]

BID must be extremely large and easy to tap.

========================================================
12. FRANCHISE BID FLOW
========================================================

When the franchise taps BID:

BUTTON:

BID SUBMITTING…

Then if successful:

BID ACCEPTED

CURRENT BID
200

TIMER RESET
20

If rejected:

BID BLOCKED

Maximum permissible:
180

Reason:
You must preserve credits for mandatory
squad requirements.

Never claim a bid succeeded until the server confirms it.

========================================================
13. PASS FLOW
========================================================

A franchise can:

IN PLAY
→ PASS
→ PASSED

But Pass is reversible before hammer:

PASSED
→ RE-ENTER
→ IN PLAY

All 11 franchises can press Pass.

Timer continues even when everyone has passed.

UI:

PASSED

[ RE-ENTER ]

========================================================
14. CONNECTION STATE
========================================================

Every franchise screen must show connection status.

CONNECTED
RECONNECTING
OFFLINE
SYNCING
CONNECTED

Example:

● CONNECTED

When disconnected:

⚠ CONNECTION LOST

Auction state may be stale.

When restored:

SYNCING AUCTION STATE…

Then:

● CONNECTED

Never claim a bid was accepted if the server has not acknowledged it.

========================================================
15. PUBLIC VIEW
========================================================

Public remains completely unauthenticated.

Homepage navigation:

ACC
Players
Franchises
Live Auction

Right:

WATCH LIVE

Do not expose internal login portals prominently.

Use a discreet:

Staff Login

link for authorized users.

Public can view:
- players
- teams
- squads
- auction
- sold/unsold
- purse
- maximum permissible bid
- bucket status
- scarcity
- current lot

Do not show:
- mobile numbers
- private authentication data
- internal admin information

========================================================
16. PUBLIC HOME PAGE
========================================================

Use a premium hero.

Small label:

AVANTHI CRICKET CARNIVAL
· PLAYER AUCTION 2026

H1:

THE AUCTION
IS LIVE.

Subheading:

11 franchises.
Hundreds of players.
One authoritative auction.

Primary:

WATCH LIVE AUCTION →

Secondary:

EXPLORE PLAYERS

Hero visual:

current auction lot card.

Show:

PLAYER
CURRENT BID
TEAM
TIMER
LIVE STATUS

========================================================
17. PROJECTOR
========================================================

/projector

No login.

Read only.

No normal navbar.

Full-screen.

Huge typography.

Show:

PLAYER PHOTO

PLAYER NAME

PLAYER TYPE

BASE PRICE

CURRENT BID

HIGHEST BIDDER

TIMER

ELEVEN TEAM LOGOS

Team status:

ACTIVE
PASSED
BLOCKED

The UI must be readable across a large auditorium.

========================================================
18. PREMIUM TYPOGRAPHY SYSTEM
========================================================

Typography is a major part of the product identity.

Use:

Primary UI:
Inter

Display:
Space Grotesk

Auction numbers:
JetBrains Mono

Use remote font loading or bundled web fonts depending on project policy.

Typography hierarchy:

Display:
clamp(3rem, 8vw, 8rem)

Hero:
clamp(2.5rem, 6vw, 7rem)

Section title:
clamp(1.75rem, 3vw, 3rem)

Body:
1rem–1.125rem

Micro label:
0.6875rem–0.75rem

Auction price:
clamp(4rem, 12vw, 11rem)

Timer:
clamp(3rem, 8vw, 8rem)

Use:

font-variant-numeric: tabular-nums

for:
prices
timers
purse
squad counts
lot numbers

Use uppercase labels with controlled letter spacing.

Example:

CURRENT BID

180

CREDITS

Do NOT put every piece of text in bold.

Use contrast between:
size
weight
spacing
colour
line-height

========================================================
19. TYPE HIERARCHY RULE
========================================================

At any moment the user must instantly identify:

1. What is happening?
2. What is the current value?
3. What action can I take?
4. What restriction exists?
5. What happens next?

The design must answer these in that order.

========================================================
20. DESIGN TOKENS
========================================================

Create a professional CSS token system.

Background:

#050807
#09110D
#0E1813

Surface:

#111C16
#17241D
#1D2D24

Primary:

#19C37D

Auction:

#FF8A1F

Warning:

#FFD166

Danger:

#FF4D4F

Text:

#F5F7F6
#DCE5DF
#93A59A
#6E8175

Semantic meaning:

GREEN
active / legal / success / connected

ORANGE
auction / action / bid

YELLOW
scarcity / warning / attention

RED
blocked / failure / destructive

GREY
passed / inactive / unavailable

Never use colour only for decoration.

========================================================
21. VISUAL LANGUAGE
========================================================

Use premium modern product design:

- clean 12-column layout
- generous whitespace
- thin borders
- restrained shadows
- subtle surface elevation
- crisp typography
- precise alignment
- asymmetrical hero layouts
- controlled radius
- subtle motion

Avoid:
- excessive glassmorphism
- excessive gradients
- excessive rounded boxes
- neon cyberpunk
- sports clipart
- generic Bootstrap cards
- giant random icons
- excessive animations

The current screenshot uses soft gradients and rounded cards.

Keep the polished feel but make the new authentication and application surfaces more structured and premium.

========================================================
22. LOGIN PAGE VISUAL STRUCTURE
========================================================

Desktop:

┌────────────────────────────┬─────────────────────────────┐
│                            │                             │
│   ACC                       │       SIGN IN              │
│                            │                             │
│   PLAYER                   │       Continue as           │
│   AUCTION 2026             │                             │
│                            │       [ FRANCHISE ]         │
│   The authoritative       │       [ PLAYER ]            │
│   auction platform         │       [ ADMIN ]             │
│                            │       [ SUPER ADMIN ]       │
│                            │                             │
│   ● LIVE                   │       Mobile                │
│                            │       [____________]        │
│                            │                             │
│                            │       [ SEND OTP ]          │
│                            │                             │
└────────────────────────────┴─────────────────────────────┘

Mobile:

ACC

SIGN IN

Continue as

[ Franchise ]

[ Player ]

[ Staff ]

then:

authentication form

PUBLIC:
View public auction →

========================================================
23. STAFF LOGIN
========================================================

Instead of making separate public login buttons for Admin and Super Admin, create:

STAFF LOGIN

Then internally authenticate:

SUPER ADMIN
or
ADMIN / HANDLER

Do not reveal privileged account details.

Use a role-aware transition:

VERIFYING STAFF ACCESS…

AUTHENTICATED

SUPER ADMIN CONSOLE

or

AUCTION HANDLER

========================================================
24. DASHBOARD INFORMATION HIERARCHY
========================================================

Do not put 30 cards on screen.

Every dashboard should have:

Header
↓
critical metrics
↓
active work
↓
secondary information
↓
history

Critical information gets large typography.

Secondary information gets quieter typography.

========================================================
25. DESIGN STATES
========================================================

Create reusable components for:

SUCCESS
WARNING
ERROR
INFO
LIVE
CONNECTED
RECONNECTING
OFFLINE
BLOCKED
PASSED
ACTIVE
SOLD
UNSOLD
ALLOTTED
SCOUTED
PENDING
VERIFIED
UNPAID

Example:

● LIVE

⚠ SCARCITY

⊘ BLOCKED

✓ VERIFIED

— PASSED

========================================================
26. MOTION SYSTEM
========================================================

Use motion similar to a sophisticated product interface.

Motion should communicate state.

Bid:

180 → 200

Price briefly scales.

Timer:

20 → 19 → 18

No dramatic animation.

Blocked bid:

button gives one short shake.

Connection lost:

status transitions smoothly.

Sale:

SOLD transition.

Avoid:
- bouncing everything
- continuous floating animation
- excessive parallax
- unnecessary page transitions

Support:

prefers-reduced-motion

========================================================
27. LOGIN MICROINTERACTIONS
========================================================

Role selected:

card becomes active.

OTP sent:

button changes:

OTP SENT

01:59

Verification:

spinner/ray animation

Success:

subtle green confirmation.

Wrong code:

field error + explanation.

Network error:

TRY AGAIN

Do not clear all user input unnecessarily.

========================================================
28. RESPONSIVE STRATEGY
========================================================

Build mobile-first.

Critical widths:

360
390
430
768
1024
1280
1440
1920+

Use:

CSS Grid
Flexbox
Container Queries
clamp()
min()
max()

Do not simply shrink desktop UI for mobile.

Especially:

FRANCHISE BIDDING

must be designed specifically for one-handed phone use.

========================================================
29. SEMANTIC HTML5
========================================================

Use:

header
nav
main
section
article
aside
footer
form
fieldset
legend
button
dialog

No giant div-only architecture.

========================================================
30. JAVASCRIPT ARCHITECTURE
========================================================

Use ES modules.

Example:

js/
  auth/
    auth.js
    session.js
    guards.js

  auction/
    auction.js
    bidding.js
    timer.js

  registration/
    registration.js
    roll-parser.js

  franchise/
    franchise.js

  admin/
    admin.js

  public/
    public.js

  realtime/
    websocket.js

  state/
    store.js

No global spaghetti.

========================================================
31. ROUTE GUARDING
========================================================

Examples:

/login

/public

/players

/auction

/player

/franchise

/admin

/admin/auction

/projector

Every protected route must verify session + role.

Examples:

/admin
→ SUPER_ADMIN or ADMIN

/admin/settings
→ SUPER_ADMIN only

/franchise
→ FRANCHISE only

/player
→ PLAYER only

/projector
→ PUBLIC READ ONLY

========================================================
32. SESSION MODEL
========================================================

Authenticated session should contain:

userId
role
franchiseId if applicable
playerId if applicable
sessionId

Never trust role values supplied directly by the client.

========================================================
33. SECURITY
========================================================

Frontend is NOT the authorization layer.

Backend must enforce every permission.

Never expose:
- password
- OTP
- private mobile numbers
- private account data

Public APIs must exclude mobile numbers entirely.

========================================================
34. FRANCHISE REGISTRATION
========================================================

Build:

TEAM INFORMATION

Team name
Unique validation
Team logo

FACULTY COORDINATOR

Name
Department
Photograph
Mobile number

CAPTAIN LOGIN

Optional captain mobile

CAPTAIN

Must be selected from already registered players.

VICE-CAPTAIN

Must be selected from already registered players.

REFERRED PLAYERS

Select from registered eligible students.

Then:

SUBMIT FOR ADMIN APPROVAL

========================================================
35. FRANCHISE APPROVAL
========================================================

Workflow:

PENDING

↓

SUPER ADMIN REVIEW

↓

APPROVED

↓

PURSE = 1000 CREDITS

Show state visibly.

If rejected is not defined by the specification,
do not invent a rejection workflow.

Use:

REQUIRES CORRECTION

where necessary.

========================================================
36. PLAYER PUBLIC PROFILE
========================================================

Player card:

Photo

Name

Derived type

Branch

Year

Bucket

Base price

Skills

Statistics

CricHeroes

Status

Do not expose mobile.

========================================================
37. AUCTION LOGIC UI
========================================================

Bucket order:

B3
→ B4
→ B2
→ B5
→ B1
→ PG

Current bucket should be visible.

Example:

ROUND 01

B.TECH YEAR 3

LOT 023 / 087

========================================================
38. DRAW SYSTEM
========================================================

Two modes:

GUEST MODE

Operator enters guest-called number.

AUTO MODE

System chooses randomly.

Display:

DRAW MODE
GUEST

or:

DRAW MODE
AUTO

No number may be called twice.

Skip:

SKIP PLAYER

Player goes to end-of-bucket recall.

If not recalled:

ROUND 2

========================================================
39. BID RULES
========================================================

Base price comes from registration ladder.

Live bid increments:

below 100:
+10

100–199:
+20

200+:
+30

No jump bidding.

Examples:

90 → 100
100 → 120
200 → 230

The frontend must request the next legal bid from authoritative state.

========================================================
40. TIMER
========================================================

Initial timer:

30 seconds

After first accepted bid:

20 seconds

Every accepted bid:

reset to full 20 seconds

Timer continues when all franchises pass.

Timer expiry:
does NOT sell the player.

Only hammer completes the sale.

========================================================
41. HAMMER UX
========================================================

Show:

HAMMER SALE

Player
Price
Highest bidder

Confirm:

[ CANCEL ]
[ HAMMER SALE ]

Once confirmed:

SOLD

Then update:
purse
squad
bucket
maximum bid
scarcity
history

========================================================
42. UNDO UX
========================================================

Super Admin only.

Can undo any historical sale.

UI:

AUCTION HISTORY

Sale #0842

Player
Team
Price
Time

[ UNDO SALE ]

Require reason.

After undo:

- refund purse
- free slot
- return player to pool
- recalculate limits
- recalculate bucket requirements
- recalculate scarcity
- preserve original history

Do not delete the original event.

Display:

UNDONE

not deleted.

========================================================
43. AUDIT UX
========================================================

Audit entries:

WHO

ROLE

ACTION

ENTITY

TIME

REASON

Example:

19:42:31

SUPER ADMIN

HAMMER

LOT #024

SAI TEJA

TITANS

180 CREDITS

Another:

19:48:11

SUPER ADMIN

UNDO

SALE #024

Reason:
Wrong franchise recorded

========================================================
44. SCARCITY UI
========================================================

Scarcity is a WARNING, not a block.

Example:

⚠ DIPLOMA SCARCITY

11 players remain

11 required

BIDDING REMAINS OPEN

This state must appear on:

Admin
Projector
Public

Never block legal bidding because another franchise is already satisfied in that bucket.

========================================================
45. ROUND 2
========================================================

After Round 1:

reopen all unsold players

including skipped players that were not recalled

reset base price:

20 credits

Franchises may request:
specific player
entire bucket

Admin orders/approves queue.

Captains may recall previously passed players before Round 2 closes.

========================================================
46. ALLOTMENT / SCOUTING
========================================================

Auto-allotment:

available unsold player
→ 20 credits
→ franchise needing that bucket

Display:

ALLOTTED

Never call it SOLD.

Scouting only when bucket genuinely exhausted.

Uniform relaxation applies to all franchises.

========================================================
47. CURRENT PROJECT SCREEN
========================================================

The current screenshot's public UI can remain the primary visual baseline.

However, improve:

- typography hierarchy
- role navigation
- public vs internal separation
- login entry
- state communication
- data density
- accessibility
- mobile franchise flow

Do not destroy the existing premium look unnecessarily.

========================================================
48. COMPONENT DESIGN SYSTEM
========================================================

Create:

ACCLogo

TopNav

RoleSelector

LoginCard

OTPField

SessionIndicator

UserMenu

MetricCard

PlayerCard

FranchiseCard

AuctionPlayer

PriceDisplay

Timer

BidButton

PassButton

TeamStatus

BucketCard

ScarcityBanner

AuditTimeline

ConfirmationDialog

Toast

SearchBar

FilterBar

DataTable

Skeleton

EmptyState

ErrorState

ConnectionStatus

========================================================
49. PREMIUM CSS
========================================================

Use:

CSS custom properties

container queries

clamp()

logical properties

modern selectors

Grid

Flexbox

aspect-ratio

backdrop-filter only where useful

CSS animations

prefers-reduced-motion

Do not use:

!important

random magic numbers

duplicated CSS

inline styles

deeply nested CSS

========================================================
50. ACCESSIBILITY
========================================================

Every interactive element:

keyboard accessible

focus-visible

correct semantic element

aria-live where relevant

Current bid:

aria-live="polite"

Critical errors:

role="alert"

Timer:

accessible textual representation

Never rely only on colour.

========================================================
51. DATA PRIVACY
========================================================

Public API:

DO NOT return mobile numbers.

Private franchise/admin/player APIs may return only what their permissions require.

Never solve privacy by simply hiding a DOM element.

========================================================
52. FINAL USER JOURNEY
========================================================

PUBLIC:

Landing
→ Explore players
→ Explore teams
→ Watch live auction

PLAYER:

Login
→ Player dashboard
→ Complete profile
→ Manage CricHeroes
→ View auction eligibility

FRANCHISE:

Login
→ Franchise dashboard
→ Squad
→ Purse
→ Current lot
→ Bid/Pass
→ Live updates

ADMIN:

Login
→ Operational console
→ Draw
→ Run auction
→ Skip
→ Hammer
→ Monitor state

SUPER ADMIN:

Login
→ Full control center
→ Verify
→ Configure
→ Run
→ Correct
→ Undo
→ Audit
→ Export

PROJECTOR:

Open /projector
→ Full-screen live state

========================================================
53. IMPORTANT ARCHITECTURAL PRINCIPLE
========================================================

There is ONE authoritative auction state.

The different interfaces are different views of it.

                    AUCTION ENGINE
                         |
        ┌────────────────┼────────────────┐
        |                |                |
      ADMIN          PROJECTOR         PUBLIC
        |
    FRANCHISE

Never maintain independent auction logic in each interface.

========================================================
54. VISUAL HIERARCHY TARGET
========================================================

For the live auction screen:

1. CURRENT PLAYER
2. CURRENT BID
3. HIGHEST BIDDER
4. TIMER
5. TEAM STATES
6. PLAYER DETAILS
7. SECONDARY STATISTICS

For franchise:

1. NEXT BID
2. CURRENT BID
3. MAX LEGAL BID
4. PURSE
5. TIMER
6. BUCKET STATUS
7. PLAYER DETAILS

For admin:

1. AUCTION CONTROL
2. CURRENT LOT
3. TIMER
4. BID
5. FRANCHISE STATES
6. SCARCITY
7. HISTORY

For login:

1. WHO AM I?
2. AUTHENTICATION
3. SECURITY STATE
4. CONTINUE

========================================================
55. DO NOT OVER-DESIGN
========================================================

The product should feel sophisticated because of:

typography
spacing
alignment
hierarchy
interaction
state
motion

NOT because of:

huge gradients
neon colours
3D gimmicks
excessive blur
random animations

========================================================
56. FINAL IMPLEMENTATION REQUIREMENT
========================================================

Do not only produce mockups.

Implement the actual frontend.

Build:

HTML5
Modern Vanilla CSS
Vanilla JavaScript

Use mock backend/state where necessary.

Every major interaction must work in demo mode.

Login role switching must work.

Route protection must work in demo mode.

Franchise account switching must work.

Player registration must work.

Admin console must work.

Auction simulation must work.

Bid / Pass / Timer / Hammer must work.

Public and projector views must update from the same state.

========================================================
57. FINAL QUALITY TEST
========================================================

Before declaring complete, verify:

Can a public user enter without login?

Can a player login?

Can a franchise login using coordinator?

Can captain login through the same franchise account?

Can admin/handler login?

Can Super Admin login?

Can the UI distinguish Super Admin from Admin?

Can an unauthorized role access restricted pages?

Can four franchises bid simultaneously in demo mode?

Can the bid be blocked correctly?

Can Pass be reversed?

Can the timer reset?

Can all franchises pass while timer continues?

Can Hammer complete a sale?

Can Undo reverse an old sale?

Can the projector reflect live state?

Can the public view reflect live state?

Can connection loss/reconnection be represented?

Does the visual hierarchy remain clear at 360px?

Does the projector remain readable at 1920px?

========================================================
58. FINAL IMPRESSION
========================================================

The finished product should make a judge think:

"This is not a college CRUD website."

"It feels like a real auction operating system."

"It has the precision of a financial product."

"It has the energy of a live cricket auction."

"It is beautiful, but the beauty is serving the workflow."

Build that level of product.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-25T15:12:16+05:30.
</ADDITIONAL_METADATA>