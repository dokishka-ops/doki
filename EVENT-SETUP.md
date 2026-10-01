# Event reader setup

Reader URL: `/hanataba15/`. Do not add a link to the profile page.

Server checks every image request against the publication interval:
2026-10-04 22:10 JST (inclusive) to 2026-10-06 22:10 JST (exclusive).
Client clocks and query parameters cannot override it. Before and after the
event, the landing page shows a status message but the API denies image access.
Previously downloaded images and screenshots cannot be revoked.

## Remaining setup before the event

1. Receive ordered manga images, title, and any content/age notices from the creator.
2. Create a PRIVATE Vercel Blob store attached to this project.
3. Upload images directly to that store. NEVER add comic images to GitHub or a public static directory.
4. Set production environment variables and redeploy:
   - `BLOB_READ_WRITE_TOKEN`: store credential, kept server-side only.
   - `EVENT_COMIC_BLOB_BASE`: `https://<store-id>.private.blob.vercel-storage.com/`
   - `EVENT_COMIC_PAGES`: ordered JSON array, for example
     `[{"pathname":"hanataba15/page-001.webp","width":1200,"height":1800}]`.
     Use exact uploaded pathnames, including any random suffix. Only PNG/JPEG/WebP accepted.
5. Verify authenticated private storage, production API, and reader images before opening.
   Test dates locally only; NEVER deploy a date-bypass parameter or preview image endpoint.

No images/storage have been provisioned yet. If required settings are absent,
the reader fails closed and shows a preparation message during the event.
Private Blob URLs and credentials are not sent to the reader.
