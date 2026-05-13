## Replace homepage hero image

Replace the right-side hero image on the home page (`/`) with the uploaded modern farmhouse exterior photo.

### Steps
1. Copy `user-uploads://2f30910c…jpeg` → `src/assets/hero-home.jpg`.
2. In `src/pages/Index.tsx`, swap the `hawthornHomepage` import for the new asset and update the `<img src>` on line 142. Alt text stays as "Modern BaseMod home exterior".
3. Leave layout, animation, and the `aspect-[4/3]` framing unchanged.

### Notes
- No other pages or components touched.
- `hawthornHomepage` import is removed if unused elsewhere in the file (will verify).
- No publish, no migrations, no env changes.