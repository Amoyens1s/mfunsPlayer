import axios from "axios";
import utils from "./utils";

export default {
  send: (options) => {
    axios
      .post(options.url, options.data)
      .then((response) => {
        const data = response.data;
        if (!data || data.code !== 0) {
          options.error && options.error(data && data.msg);
          return;
        }
        options.success && options.success(data);
      })
      .catch((e) => {
        console.error(e);
        options.error && options.error(e);
      });
  },
  read: (options) => {
    axios
      .get(options.url)
      .then((response) => {
        const data = response.data;
        if (!data) {
          options.error && options.error(data && data.msg);
          return;
        }
        switch (options.type) {
          case "dplayer-danmaku":
            options.success &&
              options.success(
                data.data.map((item) => ({
                  time: item[0],
                  type: item[1],
                  color: item[2],
                  author: item[3],
                  text: item[4],
                  size: item[5] ?? 25,
                  date: item[6] ?? 0,
                }))
              );
            break;
          case "mfuns-advDanmaku-oldApi":
            // 此处为高级弹幕包裹信息
            options.success &&
              options.success(
                data.data.map((item) => {
                  let a = JSON.parse(item);
                  return {
                    time: a[0].start / 1000 || 0,
                    type: 8,
                    mode: 8,
                    author: "0",
                    text: item,
                    date: 0,
                  };
                })
              );
            break;
          case "bili-danmaku":
            break;
          case "acfun-danmaku":
            break;
          default:
            options.success && options.success(data);
        }
      })
      .catch((e) => {
        console.error(e);

        options.error && options.error(e);
      });
  },
};
