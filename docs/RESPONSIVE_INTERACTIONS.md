# Responsive interaction changes

FAQ plus indicators are 2.8 times the question font size, a 180% increase. They remain vertically centered, do not shrink, and rotate when their native details panel opens.

The hero rotates through seven gate, door and interior images, displaying each for ten seconds. Explore the designs links to the gallery and Plan your project links to the contact section. Numbered selectors and visible playback text are removed. A pause/resume icon is available to screen readers and appears only when reached by keyboard focus. Rotation stops while the hero has keyboard focus, when the tab is hidden, and initially for visitors who prefer reduced motion. The separate discovery link and image captions remain removed.

Action buttons have no decorative arrow icons. Labels are centered inside each control at all widths. Service enquiry actions use visible Enquire labels, and gallery controls use Previous and Next labels while retaining their accessible names, keyboard shortcuts and touch behavior.

Heading font sizes are 70% of the prior values, including every minimum, fluid viewport term, maximum and breakpoint override. Heading utility classes, error headings and shared dialog/card titles use the same reduction. Body copy, navigation labels and the decorative footer wordmark keep their existing sizes. The change uses font sizing rather than visual transforms so layout wraps around the actual smaller text.

The shared radius token is 12px at every viewport width. Tailwind radius variants resolve to that token, and legacy arbitrary rounded classes plus native controls are normalized by src/interaction.css. Components without visible rounded surfaces remain ordinary layout elements. Action buttons and button-style links use the light-blue hover token with navy text. Gallery image cards retain their button semantics and keyboard focus indicators but have no hover background, zoom, glow, outline or lift. Other cards and sections have no hover highlights, including the contact card and expanded FAQ panels. The footer wordmark is 50% larger than its previous responsive type scale, centered, and cropped to half its line height. The footer enquiry heading and explanatory paragraph have been removed; its existing enquiry form remains available.

Navigation indicates the currently viewed section. Scroll tracking runs at most once per animation frame, uses passive scroll listening, and removes its listeners on unmount. The mobile menu closes with Escape, restores focus to its trigger, and closes when resized to desktop navigation.

The homepage header scrolls naturally until the services section has passed the top of the viewport, then pins to the top. Its original space is reserved to avoid a layout jump; scrolling back above that threshold restores normal positioning. Policy pages retain their existing sticky header.

Decision: use GSAP for brief, one-time section reveals and CSS for hero crossfades and the header entrance. The animation engine loads only when service content enters view, and content remains visible if it cannot load. Reduced motion disables reveals and decorative transitions. Alternatives: adding Remotion or Three.js would introduce video-rendering or 3D machinery without a corresponding site requirement. Revisit if a real video composition or interactive 3D product viewer is commissioned.

Both galleries use DesignLightbox: controlled selection, native previous/next buttons, arrow-key navigation, touch-swipe navigation, wraparound and a announced image counter. The existing Radix dialog supplies focus containment, Escape closure and trigger-focus restoration. A single-image category disables previous/next controls. No client data is uploaded.

On mobile the project gallery shows all 33 designs without an expansion step. Cards stick below the navigation header and replace one another as the visitor scrolls, releasing at the end of the gallery. Category filters retain the same behavior and each card opens the lightbox. Card height is limited to leave its caption and the header visible on shorter screens; focused cards paint above the stack so keyboard focus remains visible. Desktop retains the initial eight-card grid and View all action. Images remain responsive and lazy-loaded.

Hover styling is limited to devices with a fine pointer and hover capability. Touch devices retain click/tap feedback, with at least 44px targets for image controls and dialog closure. Reduced-motion preferences remove decorative transitions and animated scrolling. Native forms retain validation and browser-only project-brief preparation.

Phone layouts use single columns for process steps, finish details and project designs. Form actions stack and long text wraps. Tablet spacing and landscape image viewers are adjusted independently. The centered logo, 15% size increase and 20% navbar-height reduction are retained.

Decision: use shared tokens, CSS states and one gallery viewer instead of separate device-specific components or an animation library. Revisit when real-device feedback identifies a platform-specific issue. Viewport and touch emulation are not a substitute for testing every physical device or browser engine.
