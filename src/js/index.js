import mfunsPlayer from "./player";
import "../css/index.scss";

if (globalThis) {
  globalThis.mfunsPlayer = mfunsPlayer;
  console.log(
    `${"\n"} %c mfunsPlayer v2.1.0 %c https://github.com/Mfuns-cn ${"\n"}${"\n"}`,
    "color: #fff; background: #7b7ff7; padding:5px 0;",
    "background: #f5f5f5; padding:5px 0;"
  );
}
