# Humane Design Language

This document does not define fixed values for any product or platform. It defines the relationships that everything built with this language shares. Concrete values and components belong to the design systems that implement it. Palette, spacing, and type ratios introduced as examples illustrate relationships rather than fixing system values. The minimum support for twice-default text size and the duration exponent range are normative requirements.

The document has three layers:

- **Premises** describe how people perceive and act. They are the reasons.
- **Rules** follow from the premises. Each rule names the premise it comes from.
- **Signature** lists deliberate aesthetic choices. They do not follow from perception. They make the language recognizable.

When a situation is not covered by a rule, decide from the premises.

## Intent

Interfaces respond promptly, behave predictably, remain stable, and keep users in control.

- Space and color keep it **predictable and stable**.
- Time keeps it **timely**.
- Respect for the user's control keeps it **comfortable**.
- Continuous transitions make changes easier to follow. Motion responds only to the user or to a real change in state. It never exists to capture attention.

## Premises

**Luminance carries structure.** The visual system builds edges, grouping, and hierarchy mainly from differences in lightness. Hue and saturation carry identity and signal, not structure. Hierarchy must remain clear in grayscale.

**Rarity creates signal.** An element stands out to the degree that it differs from its surroundings. Saturation works as a signal only while it is rare. Every saturated element that is not a signal weakens every element that is.

**Continuity saves effort.** When an object changes state in place, people understand the change without thinking. When an object disappears and something appears elsewhere, people must work out whether the two are related.

**Control creates safety.** Unexpected changes can disrupt users. Irreversible actions require clear consequences and safeguards.

**Attention is finite.** Unnecessary elements compete with useful information for attention.

**Perception varies.** People differ in vision, color perception, motion tolerance, reading ability, and input method, and the same person differs between moments. A rule that works only for the typical user is not met.

## Rules

### Space

**Divide with planes.** Separate regions with surfaces of different lightness, not with lines. A surface is a broad area of lightness contrast. A line is narrow, high-frequency noise. *(Luminance carries structure.)*

**Lines are for dense repetition only.** Use a structural separator line only where items on the same plane repeat at a density where whitespace would cost too much space, as in tables and long lists. Control boundaries and focus indicators are signals, not structural separators, and follow their own rules. *(Attention is finite.)*

**Outlines do not separate.** Do not draw outlines around content to set it apart. Create the boundary with a difference in surface lightness. *(Luminance carries structure.)*

**Focus is a signal, not a separator.** The keyboard focus indicator is exempt from the outline rule. It may be an outline, and it may be saturated, because it marks where the user is acting. It must always be visible. *(Perception varies.)*

**Interactive boundaries meet a contrast floor.** When a control is recognized by its edge, as a checkbox or a slider track is, that edge meets the system's contrast floor against its surroundings, whether it comes from a fill or a line. A control recognized by its words, such as a button by its label or a text field by its label, placeholder, or glyph, depends on their contrast instead, and needs no outline. Controls must remain identifiable against their backgrounds. *(Perception varies.)*

**Whitespace is syntax.** Without lines, space is what groups elements. Every gap means something. The gap between groups is clearly larger than the gap within a group (for example, at least twice as large). *(Luminance carries structure.)*

**A heading sits closer to what it introduces.** The gap below a heading is smaller than the gap above it, so every heading visibly belongs to the content that follows. The system defines these gaps for each pair of levels, such as the gap between two sections of the same level and the gap between a section and its first subsection. *(Luminance carries structure.)*

**Padding is small, text is large.** Space inside a surface exists only to group. Padding beyond that carries no information, so it stays small, and the room it frees goes to larger text. *(Attention is finite. Perception varies.)*

**Insets are measured to the ink.** The space inside a surface runs from its edge to what the eye sees: the cap height of the first line of text, the baseline of the last, the edge of a control. Measured that way, the inset is the same on all four sides. Leading belongs between lines of text, never between text and an edge. *(Luminance carries structure.)*

**Structure strengthens with contrast.** When the user asks for higher contrast, boundaries, lines, and focus indicators become thicker, not only darker. *(Perception varies.)*

### Color

**Measure lightness perceptually.** Define palette lightness in a perceptual color space, such as OKLCH or CIELAB. HSL lightness is not perceptual and must not be used to establish the hierarchy. Verify accessibility contrast separately using the relative luminance of the actual foreground and background colors, including their hue, chroma, gamut mapping, and any compositing. *(Luminance carries structure.)*

**A step is a lightness contract.** In every palette, a step number names a target perceptual lightness, not a hue's shade. Equal step distances do not guarantee equal contrast ratios. A system publishes approved step pairings only after verifying their actual colors across supported hues, chroma, and modes. Consumers may use those verified pairings without repeating the measurement; arbitrary pairings still need checking. *(Luminance carries structure.)*

**Hierarchy comes from lightness, then hue, then saturation.** Essential content never shares a level with non-essential content. Establish hierarchy with lightness contrast. Add hue only when lightness is not enough. Add saturation only when hue is not enough. *(Luminance carries structure.)*

**Saturation belongs to state.** Neutral is the default. High saturation marks state that needs the user: an error, the focus position, a destructive action, a selection. It is never decoration. Brand identity lives in type, shape, and motion, not in saturation. *(Rarity creates signal.)*

**Spend signals on a budget.** Each region of a view has a signal budget defined by the system (for example, one independent signal). The system defines region boundaries and how related marks are counted. Focus is always visible and is never suppressed to meet a budget. Concurrent actionable errors remain exposed; a budget must not conceal information needed to act. *(Rarity creates signal.)*

**Check signals against the lightness hierarchy.** Saturated colors look brighter than their measured lightness. Place every signal color in the lightness hierarchy by how bright it looks, and verify it in grayscale. *(Luminance carries structure.)*

**Equal consequence, equal weight.** Choices with equal consequence for the user receive equal visual weight. "Accept" and "Decline" are equals. The language must never be used to steer users toward the option that serves the product. *(Control creates safety.)*

**Every mode is built, not inverted.** Light and dark modes each define their own lightness steps and are each verified against the contrast floor. Within a mode, the direction that means "raised" stays the same everywhere. *(Perception varies.)*

**Scheme and contrast are separate choices.** Light or dark is one setting. Standard or high contrast is another. The four combinations are each built and each verified. Preferring dark never implies wanting maximum contrast, and needing high contrast never forces a dark background. *(Perception varies.)*

### Type

**Type hierarchy comes from size and weight first.** Size and weight change how dark a block of text looks, which makes them lightness tools. Build hierarchy with them before changing text color. *(Luminance carries structure.)*

**Levels are far apart.** Adjacent levels of the type hierarchy differ enough in size to be told apart at a glance, without comparing them side by side (for example, each level at least 1.2 times the one below). Levels that are close in size read as the same level with a mistake. *(Luminance carries structure.)*

**Text size belongs to the user.** Text follows the size the user set in their browser or system, and the layout reflows without loss up to at least twice the default size. *(Perception varies.)*

**Labels are set like text.** Section labels, headings, and captions use the same proportional typeface, sentence case, and normal letter spacing as the rest of the interface. Monospace is reserved for code and for data that must align by character. Tracked, uppercase, or monospace labels such as "R E P O S I T O R I E S" are not used. Wide spacing and capitals break familiar word shapes and slow reading, and the style is decoration. A label is distinguished by weight, lightness, and the space around it. *(Attention is finite.)*

**One thought per sentence.** Interface copy does not use em-dashes. An em-dash joins two thoughts into one line and makes the reader parse an aside. Use a period, a colon, or a second line. *(Attention is finite.)*

### Time and Motion

**Motion is a morph.** Elements do not slide in, swap out, or replace each other. Existing elements transform into their new state. The object at the start and the object at the end are visibly the same object. *(Continuity saves effort.)*

**New things grow from their trigger.** When new content has no earlier form, it morphs out of the element that caused it, such as the item the user tapped. Only when nothing caused it does it appear with a minimal fade in place. *(Continuity saves effort.)*

**Removed things go somewhere.** A removed element collapses toward where it went, or shrinks in place, and its neighbors close the gap by morphing. Nothing vanishes and leaves a hole. *(Continuity saves effort.)*

**Respond at once.** Visible feedback begins on the first frame after input. *(Control creates safety.)*

**Duration grows with scale, and the difference shows.** A larger change takes longer, so users can predict timing from the size of the change. Small changes are close to instant, and the gap between a small change and a large one is wide enough to notice. Duration grows with the size of the change raised to a power between one half and one (for example, 0.75), from a low floor up to a ceiling. The system defines what size means, such as distance traveled or area changed. *(Continuity saves effort.)*

**One change, one morph.** When the target of a motion jumps, the moving element goes there directly in a single morph sized to the whole distance. It does not step through every state in between. *(Continuity saves effort.)*

**Motion is interruptible.** Every morph accepts input while it runs. A new input redirects or reverses the morph from its current position and velocity. The user never waits for an animation to finish. *(Control creates safety.)*

**Reduced motion keeps continuity.** When the user asks for reduced motion, morphs that travel or zoom are replaced by changes in place, such as a crossfade on the same object. The change is still shown. Only the travel is removed. *(Perception varies.)*

**Nothing moves idle.** There is no ambient or decorative animation. Motion that reports the progress of work the user started is a response, not idle motion. *(Attention is finite.)*

### Agency

**Never take control from the user.** Do not hijack scrolling, trap the user on a screen, override user actions, steal focus, show overlays that cannot be dismissed, start playback the user did not ask for, or intercept the back command. *(Control creates safety.)*

**Never move what the user is about to touch.** Content does not shift under the pointer or finger. Changes the user did not cause appear in a place that is not the user's target. *(Control creates safety.)*

**Reserve space for what is loading.** A placeholder takes the final shape of the content it stands for and morphs into it. Loading never shifts the layout. *(Continuity saves effort.)*

**Prefer undo to confirmation.** Make actions reversible instead of asking the user to confirm them. Save work automatically, so that no screen ever needs to intercept leaving it. Confirm only actions that cannot be undone. *(Control creates safety.)*

**Arrive quietly.** A change the user did not cause, such as an incoming message, arrives without taking focus and without interrupting input, and is announced to assistive technology without interrupting it. *(Control creates safety.)*

### Communication

**Show, and expose.** States and outcomes are shown by the change itself, not described in text. Every meaningful state that is shown is also programmatically exposed to assistive technology. Important asynchronous changes are announced appropriately, without interrupting the user or duplicating native control feedback. Exposing state does not require a live announcement for every visual update. *(Continuity saves effort. Perception varies.)*

**State lives on the object.** An object shows its own state through its form: a running task shows its progress, a live stream shows time moving. State is not stamped onto it with a text badge. "LIVE", "WORKING", "NEW", and similar pills are not used. They are saturated decoration that tells instead of shows. *(Rarity creates signal. Attention is finite.)*

**Words are for intent, commands, and errors.** Labels on actions, instructions, and error messages use language. An error says what happened and what the user can do next. Where a visual change alone would be ambiguous, add words. *(Control creates safety.)*

**Explain at the point of action, or not at all.** Do not add explanatory paragraphs, tips, or footnotes at the bottom of a screen, form, dialog, or section to describe what the interface above already shows. Text at the bottom arrives after the decision it explains. If a short hint is needed, it sits next to the control it is about. Simplify unclear controls before adding explanatory text. *(Attention is finite.)*

**Say who is behind it.** Wherever the user decides something with consequences, such as a payment, personal data, or an official record, the interface states who operates it and who is asking. *(Control creates safety.)*

## Signature

These choices are aesthetic. They do not follow from the premises, and they are what make the language look like itself.

**Sharp corners, round marks.** Every surface and control takes a 2px corner or less. The same small corner runs from the window to the smallest control, so nothing reads as a rounded card or a pill. An independent control is never square: a button, field, or row keeps a visible 2px corner. A piece inside a track may be square, because the track's corner holds the shape. Marks are round: a small solid shape that shows a state or a position inside a control or a row, such as a status dot, a radio mark, or the thumb of a switch or slider, is a circle. The switch is the one pill, because its shape is its function.

**Corners are small, never chosen.** A root's corner is capped at 2px, and every surface and control inside it takes the same cap. No element renders a corner larger than 2px, and no component chooses one. The floor is 2px, so the corner stays visible at every depth. A track takes the 2px corner; the indicator and options inside it take 0, so the inside is sharper than its holder. The switch's track is the one pill, because its shape is its function, a circle that slides between two ends. Marks take no corner from a surface; they are circles. Content that takes no press, such as an image, may be square.

**Padding follows depth, not size.** Surface padding comes from a step scale indexed by nesting depth, and it decreases as depth increases. It never scales with the container's size, so sibling surfaces of different sizes keep their content aligned. Controls are an explicit exception: their insets may derive from control height and text metrics to preserve a usable target and balanced space around the label.

**Navigation is a sidebar that morphs.** Primary navigation lives in a sidebar on the left or the right, never across the top. The sidebar is a root surface. It collapses into its own toggle and grows back out of it, so the open panel and the closed toggle are one object. Where the screen is too narrow to keep it open, it stays a toggle and grows over the content when asked.

**Content is centered.** The reading column is centered in the space beside the sidebar. Text inside it stays aligned to the start of the line.

## Translating the Language into a System

Each design system turns these relationships into values for its medium. A system defines:

- **Space:** the cap and floor for a corner, the padding step for each nesting depth, the minimum ratio between the gap separating groups and the gap within a group, the gaps above and below each heading level, and the stroke widths for standard and high contrast.
- **Color:** palette steps with target perceptual lightness and verified contrast for approved pairings, lightness steps for each of the four scheme and contrast combinations in a perceptual space, the contrast floor for text and for interactive boundaries, the chroma ceiling for neutral colors, the chroma range for signal colors, and the signal budget per region.
- **Type:** the size and weight steps of the hierarchy with the minimum ratio between adjacent levels, and the typeface used for code and aligned data.
- **Time:** the function that maps size of change to duration, its floor and ceiling, the curve or spring parameters, how a morph is redirected mid-flight, and the substitute for each morph under reduced motion.
- **Layout:** the sidebar's open width, its closed form, the width below which it stays closed, and the width of the reading column.

Values may differ between media. When the relationships hold, the result is the same language.

## Conformance Tests

A system that implements this language passes every test.

| Test | Pass condition |
| --- | --- |
| Grayscale | With all color removed, hierarchy and grouping are unchanged. |
| Line removal | With structural separator lines deleted, grouping is still clear. Control boundaries and focus indicators are not removed by this test. |
| Signal count | Each defined region meets its independent-signal budget or records a necessary actionable-error exception. Focus remains visible; related marks for one state are counted together. |
| Contrast | Text and interactive boundaries meet the contrast floor in all four scheme and contrast combinations. |
| High contrast | With high contrast on, boundaries, lines, and focus indicators are thicker than in standard contrast. |
| Text scaling | At twice the default text size, content remains available without clipping or overlap and the page does not scroll horizontally. Dense two-dimensional data may scroll within a labeled local region. Navigation and tab labels wrap rather than relying on this exception. |
| Focus | Keyboard focus is visible on every interactive element. |
| Badge audit | No text badge stands in for a state the object could show. |
| Typography audit | No em-dashes in interface copy. No tracked, uppercase, or monospace labels. |
| Bottom text audit | No paragraph below a screen, form, dialog, or section explains what the interface shows. |
| Interrupt | Input during any morph redirects it immediately from its current position and velocity, without a velocity discontinuity. |
| Single morph | When a target jumps, the moving element reaches it in one morph, without visiting the states in between. |
| Layout stability | Nothing the user did not cause moves under the pointer or finger. Loading never shifts the layout. |
| Reduced motion | With reduced motion on, every change is still visible and continuous, with no travel or zoom. |
| Screen reader | Meaningful visible state is programmatically exposed. Important asynchronous changes are announced without interrupting the user or duplicating native control feedback. |
| Agency | No focus theft, scroll hijacking, undismissable overlay, unrequested playback, or intercepted back command. |
| Symmetry | Choices with equal consequence have equal visual weight. |
| Insets | Measured from each surface's edge to the ink of its content, the four insets match. |

External reference material and upstream sources are listed in [REFERENCES.md](REFERENCES.md).
