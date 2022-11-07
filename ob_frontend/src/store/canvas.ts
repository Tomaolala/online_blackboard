import { defineStore } from "pinia";
import Canvas from "@/utils/Canvas/canvas";
import { getElPagePos } from "@/utils/Canvas/math";
import { deepCopy } from "@/utils";
import { useWs } from "@/utils/ws";
import { IFrame } from "@stomp/stompjs";

const channels = [
  {
    channel: '/exchange/room/',
    callback(frame: IFrame) {
      console.log(frame)
    }
  }, {
    channel: '/user/queue/info',
    callback(frame: IFrame) {
      console.log(frame)
    }
  }, {
    channel: '/user/queue/error',
    callback(frame: IFrame) {
      console.log(frame)
    }
  }
]

export const useCanvasStore = defineStore('canvas', {
  state: () => ({
    canvas: {} as Canvas,
    ws: {} as { send: (channel: string, data: unknown) => void, close: () => void },
  }),
  actions: {
    connect(roomId: string, isAnonymous: number) {
      channels[0].channel = channels[0].channel.substring(0, 15) + roomId
      this.ws = useWs(roomId, isAnonymous, channels)
      this.ws.send('/app/room_info', { roomId })
    },
    initCanvas() {
      let beforePosition = [0, 0]
      let AfterPosition = [0, 0]
      let IsDrawing = false
      const canvas = new Canvas({ canvas: 'canvas' })
      this.canvas = canvas

      const { x, y } = getElPagePos(document.getElementById('canvas') as HTMLElement)

      canvas.canvas.addEventListener('mousedown', e => {
        /**
         * 传入相应的坐标
         */
        console.log(canvas.context.strokeStyle)
        beforePosition = [e.pageX - x, e.pageY - y]
        canvas.DrawClass.BeforePosition = beforePosition
        IsDrawing = true
      })
      canvas.canvas.addEventListener('mousemove', e => {
        if (IsDrawing) {
          /**
           * 清空之后全部重新绘制
           */
          canvas.drawData()
          AfterPosition = [e.pageX - x, e.pageY - y]
          canvas.DrawClass.BeforePosition = beforePosition
          canvas.DrawClass.AfterPosition = AfterPosition
          canvas.DrawClass.draw(canvas)
        }
      })
      canvas.canvas.addEventListener('mouseup', e => {
        AfterPosition = [e.pageX - x, e.pageY - y]
        canvas.DrawClass.AfterPosition = AfterPosition
        canvas.DrawClass.draw(canvas)
        /**
         * 储存标记点type和相应的坐标点
         */
        canvas.data.push({
          type: canvas.DrawClass.type,
          BeforePosition: beforePosition,
          AfterPosition: AfterPosition,
          pen: deepCopy(canvas.pen)
        })
        IsDrawing = false
      })
      /**
       * 监听双击事件可选中和可拖动
       */
      canvas.canvas.addEventListener("dblclick", (e) => {
        /**
         * 判断点是否在data的图形里面在的话拿出那一个图形并绘制
         */
        canvas.drawControlBorder(e.pageX - x, e.pageY - y)
      })
    }
  },
  getters: {},
})