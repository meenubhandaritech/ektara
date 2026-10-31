# Visual asset inventory

The locally stored WebP photographs are illustrative everyday family and childhood moments. They do not depict an adoption case, identify a child available for adoption, or imply a relationship with EKTARA.

| Filename | Purpose and usage | Alt-text guidance | Source | Permission / review |
|---|---|---|---|---|
| `frontend/public/images/child-outdoors.webp` | First EKTARA story chapter; decorative backdrop behind the chapter text | Empty alt text in the story stage because the adjacent heading and body provide the content | [Unsplash photograph](https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9) | Unsplash License reviewed 2026-10-31; confirm the individual source page and suitability before production |
| `frontend/public/images/family-reading.webp` | Second EKTARA story chapter; decorative backdrop behind the chapter text | Empty alt text in the story stage; do not imply this is an adoptable child | [Unsplash photograph](https://images.unsplash.com/photo-1516627145497-ae6968895b74) | Unsplash License reviewed 2026-10-31; confirm the individual source page and suitability before production |
| `frontend/public/images/family-outdoors.webp` | Third EKTARA story chapter; decorative backdrop behind the chapter text | Empty alt text in the story stage; the chapter text conveys the message | [Unsplash photograph](https://images.unsplash.com/photo-1511895426328-dc8714191300) | Unsplash License reviewed 2026-10-31; confirm the individual source page and suitability before production |
| `frontend/public/images/story-scene.webp` | Homepage hero and final EKTARA story chapter | Hero: “A parent and two young children sharing an everyday moment at home.” Story-stage use is decorative and has empty alt text | [Unsplash photograph](https://images.unsplash.com/photo-1476703993599-0035a21b17a9) | Unsplash License reviewed 2026-10-31; confirm the individual source page and suitability before production |

The general [Unsplash License](https://unsplash.com/license) permits downloading, modifying, and using images for commercial and non-commercial purposes. License review does not verify each photograph's context or suitability. Recheck the individual source pages and ethical use before deployment; replace any asset whose provenance or permissions cannot be confirmed.

Images are stored locally as resized WebP files. The homepage hero loads eagerly; below-the-fold story photography uses lazy loading. Story-stage images are decorative, so their `alt` text is intentionally empty and the adjacent narrative remains available to screen readers.
