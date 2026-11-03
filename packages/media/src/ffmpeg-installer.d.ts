/** Il pacchetto non ha i tipi: dice solo dov'è il programma ffmpeg per questo sistema. */
declare module '@ffmpeg-installer/ffmpeg' {
  const installer: { path: string; version: string; url: string };
  export default installer;
}
