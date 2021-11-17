import { Picker, Slider, Slider_vertical } from "./components";
import utils from "./utils";
// import Thumbnails from './thumbnails';
// import Icons from './icons';

class Controller {
  constructor(player) {
    const THIS = this
    this.player = player;
    this.template = player.template;
    this.components = player.components;
    this.video = player.video;
    this.autoHideTimer = null;
    this.volumeHideTimer = null;
    this.isSetVolume = false;
    this.isControl = false;
    this.controlLeaved = false;
    this.clickFlag = 0;
    this.controllTimer = null;
    this.showDanmaku = player.showDanmaku;
    this.danmakuFontsize = 24
    this.danmakuType = "normal"
    this.danmakuColor = "#FFFFFF"
    this.player.template.videoWrap.addEventListener("mousemove", () => {
      this.setAutoHide();
    });
    this.player.template.controller.addEventListener("click", (event) => {
      window.event ? (window.event.cancelBubble = true) : event.stopPropagation();
    });
    this.isControllerfocus();
    this.initPlayButton();
    if (player.options.dragable) {
      this.initPlayedBar();
    }
    if (player.options.danmaku) {
      this.initDanmakuButton();
      this.initDanmakuStyleButton();
    }
    this.initVolumeButton();
    this.initFullButton();
    this.initTroggle();
    this.initSpeedButton();
    this.initSquirtleButton();
  }
  isControllerfocus() {
    this.template.controller.onmouseenter = () => {
      this.isControl = true;
      this.controlLeaved = false;
    };
    this.template.controller.onmouseleave = () => {
      this.isControl = false;
      this.controlLeaved = true;
    };
  }
  initPlayButton() {
    this.template.videoWrap.addEventListener("click", () => this.handleClick());
    this.template.player_btn.addEventListener("click", () => this.player.toggle());
  }
  handleClick() {
    console.log("click");
    if (!this.isControl && !this.player.isShowMenu) {
      this.player.toggle();
    } else {
      this.player.isShowMenu = false;
    }
  }
  initPlayedBar() {
    const thumbMove = (e) => {
      this.isControl = true;
      let percentage =
        ((e.clientX || e.changedTouches[0].clientX) -
          utils.getBoundingClientRectViewLeft(this.player.template.barWrap)) /
        this.player.template.barWrap.clientWidth;
      percentage = Math.max(percentage, 0);
      percentage = Math.min(percentage, 1);
      this.player.bar.set("played", percentage, "width");
      this.player.template.barTime.innerHTML = utils.secondToTime(percentage * this.player.video.duration);
      this.player.template.currentTime.innerHTML = utils.secondToTime(percentage * this.player.video.duration) + " /";
    };

    const thumbUp = (e) => {
      this.player.unableTimeupdate = false;
      document.removeEventListener(utils.nameMap.dragEnd, thumbUp);
      document.removeEventListener(utils.nameMap.dragMove, thumbMove);
      let percentage =
        ((e.clientX || e.changedTouches[0].clientX) -
          utils.getBoundingClientRectViewLeft(this.player.template.barWrap)) /
        this.player.template.barWrap.clientWidth;
      percentage = Math.max(percentage, 0);
      percentage = Math.min(percentage, 1);
      this.player.template.currentTime.innerHTML = utils.secondToTime(percentage * this.player.video.duration) + " /";
      this.player.bar.set("played", percentage, "width");
      this.player.seek(this.player.bar.get("played") * this.player.video.duration);
      setTimeout(() => {
        if (this.controlLeaved) this.isControl = false;
      }, 50);
    };
    this.player.template.barWrap.addEventListener(utils.nameMap.dragStart, () => {
      // this.player.timer.disable("progress");
      document.addEventListener(utils.nameMap.dragMove, thumbMove);
      document.addEventListener(utils.nameMap.dragEnd, thumbUp);
      this.player.unableTimeupdate = true;
    });

    this.player.template.barWrap.addEventListener(utils.nameMap.dragMove, (e) => {
      if (this.player.video.duration) {
        const px = this.player.template.barWrap.getBoundingClientRect().left;
        const tx = (e.clientX || e.changedTouches[0].clientX) - px;
        if (tx < 0 || tx > this.player.template.barWrap.offsetWidth) {
          return;
        }
        const time = this.player.video.duration * (tx / this.player.template.barWrap.offsetWidth);
        // if (utils.isMobile) {
        //   this.thumbnails && this.thumbnails.show();
        // }
        // this.thumbnails && this.thumbnails.move(tx);
        this.player.template.barTime.style.left = `${tx - (time >= 3600 ? 25 : 20)}px`;
        this.player.template.barTime.style.display = "block";
        this.player.template.barTime.innerText = utils.secondToTime(time);
        this.player.template.barTime.classList.remove("hidden");
        // 防止选择内容--当拖动鼠标过快时候，弹起鼠标，bar也会移动，修复bug
        window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
      }
    });

    this.player.template.barWrap.addEventListener(utils.nameMap.dragEnd, () => {
      this.player.unableTimeupdate = false;
    });

    this.player.template.barWrap.addEventListener("mouseenter", () => {
      if (this.player.video.duration) {
        // this.thumbnails && this.thumbnails.show();
        this.player.template.barTime.classList.remove("hidden");
        this.player.template.thumb.classList.remove("hidden");
      }
    });
    this.player.template.barWrap.addEventListener("mouseleave", () => {
      if (this.player.video.duration) {
        // this.thumbnails && this.thumbnails.hide();
        this.player.template.barTime.classList.add("hidden");
        this.player.template.thumb.classList.add("hidden");
      }
    });
  }

  initFullButton() {
    this.player.template.browserFullButton.addEventListener("click", () => {
      // window.removeEventListener("resize");
      this.player.fullScreen.toggle("browser");
      this.player.resize();
    });
    this.player.template.webFullButton.addEventListener("click", () => {
      this.player.fullScreen.toggle("web");
      this.player.resize();
    });
  }
  initSquirtleButton() {
    for (let i = 0; i < this.player.template.squirtleItem.length; i++) {
      this.player.template.squirtleItem[i].addEventListener("click", (event) => {
        window.event ? (window.event.cancelBubble = true) : event.stopPropagation();
        this.player.switchVideo(i);
      });
    }
    this.player.template.skip.addEventListener("click", () => {
      const nextVideo = this.player.currentVideo + 1;
      this.player.switchVideo(nextVideo);
    });
  }

  initSpeedButton() {
    for (let i = 0; i < this.player.template.speedItem.length; i++) {
      this.player.template.speedItem[i].addEventListener("click", (event) => {
        window.event ? (window.event.cancelBubble = true) : event.stopPropagation();
        const currentSpeed = this.player.template.speedItem[i].dataset.speed;
        this.player.speed(currentSpeed);
        this.template.speedItem[i].classList.add("focus");
        this.template.speedInfo.innerHTML = currentSpeed !== "1.0" ? currentSpeed + "x" : "倍速";

        this.template.speedItem.forEach((element, index) => {
          if (index !== i) {
            element.classList.remove("focus");
          }
        });
      });
    }
  }
  initVolumeButton() {
    const THIS = this
    this.components.volumeSlider = new Slider_vertical(this.template.volumeBar, 0, 100, 1, this.player.options.volume * 100,{
      start() {   // 开始调节滑动条（点按）
        THIS.isControl = true;
        THIS.template.volumeMask.classList.add("show");
      },
      change(value) {   // 更改进度条值，不修改绑定数据
        THIS.template.volumeNum.innerText = Math.round(value)
      },
      update(value) {   // 更改进度条值，修改绑定数据
        THIS.video.volume = value * 0.01
      },
      end() {       // 结束滑动条调节（松手）
        if (!THIS.template.volumeMask.classList.contains("show")) {
          setTimeout(() => {
            THIS.isControl = false;
          }, 150);
        }
        THIS.player.template.volumeMask.classList.remove("show");
      }
    })
    this.player.template.volumeIcon.addEventListener("click", (event) => {
      if (this.player.video.muted) {
        this.player.video.muted = false;
        if (this.video.volume) this.player.template.volumeIcon.classList.remove("volume-icon-off");
        this.components.volumeSlider.change(this.video.volume * 100);
      } else {
        this.player.video.muted = true;
        this.player.template.volumeIcon.classList.add("volume-icon-off");
        this.components.volumeSlider.change(0);
      }
    });
  }
  initDanmakuButton() {
    this.player.template.danmakuButton.addEventListener("click", () => {
      this.player.showDanmaku = !this.player.showDanmaku;
      this.player.danmaku.showing = this.player.showDanmaku;
      if (this.player.showDanmaku) {
        this.player.template.danmakuButton.classList.add("open");
        this.player.template.danmakuButton.classList.remove("close");
        this.player.danmaku.show();
      } else {
        this.player.template.danmakuButton.classList.add("close");
        this.player.template.danmakuButton.classList.remove("open");
        this.player.danmaku.hide();
      }
    });
  }
  initDanmakuStyleButton() {
    const THIS = this
    this.components.danmakuFontsizePicker = new Picker(this.template.danmaku_fontsize_picker, 24, {
      pick(value) {
        // 有关字体大小值的更改请写在此处
        THIS.danmakuFontsize = value
        console.log(`已选择字体大小：${THIS.danmakuFontsize}`)
      }
    })
    this.components.danmakuTypePicker = new Picker(this.template.danmaku_type_picker, "normal", {
      pick(value) {
        // 有关弹幕模式值的更改请写在此处
        THIS.danmakuType = value
        console.log(`已选择弹幕模式：${THIS.danmakuType}`)
      }
    })
    this.components.danmakuColorPicker = new Picker(this.template.danmaku_color_picker, "#FFFFFF", {
      created(picker) {
        // 组件创建后给颜色方块上色
        picker.items.forEach(item=>{
          item.style["background-color"] = item.getAttribute('data-value')
        })
      },
      pick(value) {
        if (/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(value)) {
          // 有关弹幕颜色值的更改请写在此处
          THIS.danmakuColor = value
          console.log(`已选择弹幕颜色：${THIS.danmakuColor}`)
          THIS.template.danmaku_color_input.value = value
          THIS.template.danmaku_color_preview.style["background-color"] = value
          if (value != value.toUpperCase()) {
            THIS.components.danmakuColorPicker.change(value.toUpperCase())
          }
        }
      }
    })
    this.template.danmaku_color_input.addEventListener('input', function () {
      this.value = '#' + this.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6)
      THIS.components.danmakuColorPicker.pick(this.value)
    })
    this.template.danmaku_color_preview.addEventListener('click', function () {
      THIS.components.danmakuColorPicker.pick(THIS.danmakuColor)
    })
  }
  initTroggle() {
    if (this.player.template.troggle) {
      this.player.template.troggle.addEventListener("click", () => {
        if (!document.pictureInPictureElement) {
          //开启
          this.video.requestPictureInPicture().catch((error) => {
            console.log(error, "Video failed to enter Picture-in-Picture mode.");
          });
        } else {
          //关闭
          // this.player.pause();
          document.exitPictureInPicture().catch((error) => {
            console.log(error, "Video failed to leave Picture-in-Picture mode.");
          });
        }
      });
    }
  }
  setAutoHide(delay = 1500) {
    this.show();
    clearTimeout(this.autoHideTimer);
    this.autoHideTimer = setTimeout(() => {
      if (this.video.played.length && !this.isControl && !this.video.paused) {
        this.hide();
      }
    }, delay);
  }

  show() {
    this.player.container.classList.remove("mfunsPlayer-hide-controller");
    this.template.controllerMask.style.cursor = "default";
    this.template.controllerMask.classList.remove("hide");
    this.template.headBar.classList.remove("hide");
  }

  hide() {
    this.player.container.classList.add("mfunsPlayer-hide-controller");
    this.template.controllerMask.style.cursor = "none";
    this.template.controllerMask.classList.add("hide");
    this.template.headBar.classList.add("hide");
  }

  isShow() {
    return !this.player.container.classList.contains("mfunsPlayer-controller-hide");
  }

  toggle() {
    if (this.isShow()) {
      this.hide();
    } else {
      this.show();
    }
  }

  destroy() {
    clearTimeout(this.autoHideTimer);
  }
}

export default Controller;
