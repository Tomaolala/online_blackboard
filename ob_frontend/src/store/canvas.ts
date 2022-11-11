import { defineStore } from 'pinia'
import Canvas from '@/utils/Canvas/canvas'
import { distance, getElPagePos } from '@/utils/Canvas/math'
import { deepCopy } from '@/utils'
import { useWs } from '@/utils/ws'
import { IFrame } from '@stomp/stompjs'
import { ElMessage } from 'element-plus'
import { ShapeDataType } from '@/utils/Canvas/type/CanvasType'
import ShapeMap from '@/utils/Canvas/ShapeMap'
import { FreeLine } from '@/utils/Canvas/shape'

export const useCanvasStore = defineStore('canvas', {
  state: () => ({
    canvas: {} as Canvas,
    ws: {} as {
      send: (channel: string, data: unknown) => void
      close: () => void
    },
    _otherUsers: [] as any[],
    sheetId: 0
  }),
  actions: {
    connect (
      roomId: string,
      isAnonymous: number,
      onDisconnect: (frame: IFrame) => void
    ) {
      this.ws = useWs(
        roomId,
        isAnonymous,
        [
          {
            channel: `/exchange/room/${roomId}`,
            callback: this._wsRoomReceive
          },
          {
            channel: '/user/queue/info',
            callback: this._wsUserReceive
          },
          {
            channel: '/user/queue/error',
            callback: this._wsErrReceive
          }
        ],
        onDisconnect
      )
    },
    _wsRoomReceive (frame: IFrame) {
      console.log('room', frame.body)
    },
    _wsUserReceive (frame: IFrame) {
      console.log('user', frame.body)
    },
    _wsErrReceive (frame: IFrame) {
      ElMessage.error({
        message: frame.body
      })
    },
    initCanvas () {
      // let PointData = []
      let beforePosition = [0, 0]
      let AfterPosition = [0, 0]
      let IsDrawing = false
      let showLine = false
      let prepareDrawing = false
      let canvas = {} as Canvas
      if (this.canvas.canvas) {
        canvas = this.canvas.reload()
        canvas.layers = canvas.layers.reload()
        this.canvas.layers.drawData()
      } else {
        canvas = new Canvas({ canvas: 'canvas' })
        canvas.layers = new Canvas({ canvas: 'canvas2' })
        this.canvas = canvas
        this.canvas.layers.context.globalCompositeOperation = 'destination-over'
        this.canvas.context.globalCompositeOperation = 'destination-over'
      }

      const { x, y } = getElPagePos(
        document.getElementById('canvas') as HTMLElement
      )

      canvas.canvas.addEventListener('mousedown', e => {
        /**
         * 传入相应的坐标
         */
        console.log(canvas.context.strokeStyle)
        beforePosition = [e.pageX - x, e.pageY - y]
        canvas.DrawClass.BeforePosition = beforePosition
        prepareDrawing = true
        showLine = true
        if (canvas.DrawClass.type === 'freeLine') {
            (canvas.DrawClass as FreeLine).data.push({
              x:e.pageX - x,
              y:e.pageY - y
            })
        }
      })

      canvas.canvas.addEventListener('mousemove', e => {
        AfterPosition = [e.pageX - x, e.pageY - y]
        // 距离超过一定值就开始画
        if (distance(AfterPosition, beforePosition) > 10 && prepareDrawing) {
          IsDrawing = true
          showLine = true
        } else {
          IsDrawing = false
          // 如果距离小于一定值且显示实时线条，则擦除线条
          if (showLine) {
            showLine = false
          }
        }
        if (IsDrawing) {
          /**
           * 清空之后全部重新绘制
           */
          // canvas.drawData()
          if (canvas.DrawClass.type !== 'freeLine') {
            canvas.context.clearRect(0, 0, 1600, 1600)
            canvas.DrawClass.BeforePosition = beforePosition
            canvas.DrawClass.AfterPosition = AfterPosition
          }else{
            /**
             * 存入data
             */
             (canvas.DrawClass as FreeLine).data.push({
              x:e.pageX - x,
              y:e.pageY - y
            })
          }

          canvas.DrawClass.draw(canvas)
        }
      })
      canvas.canvas.addEventListener('mouseup', e => {
        /**
         * 储存标记点type和相应的坐标点
         */
        prepareDrawing = false
        showLine = false
        if (!IsDrawing) {
          return
        }

        if (canvas.DrawClass.type !== 'freeLine') {
          canvas.layers.data.push({
            type: canvas.DrawClass.type,
            BeforePosition: beforePosition,
            AfterPosition: AfterPosition,
            pen: deepCopy(canvas.pen)
          })
        } else {
          canvas.layers.data.push({
            type: canvas.DrawClass.type,
            BeforePosition: beforePosition,
            AfterPosition: AfterPosition,
            pen: deepCopy(canvas.pen),
            data:(canvas.DrawClass as FreeLine).data
          })
        }
        IsDrawing = false
        /**
         * 鼠标画完之后画入第二层
         * 画入后清空上一层画布
         */
        if (canvas.DrawClass.type !== 'freeLine') {
          ShapeMap.get(canvas.DrawClass.type)?.draw(canvas.layers)
        }else{
        ShapeMap.get(canvas.DrawClass.type)?.draw(canvas.layers);
        (canvas.DrawClass as FreeLine).data=[]
        }
        canvas.context.clearRect(0, 0, 1600, 1600)
        console.log(canvas)
      })
      /**
       * 监听双击事件可选中和可拖动
       */
      canvas.canvas.addEventListener('dblclick', e => {
        /**
         * 判断点是否在data的图形里面在的话拿出那一个图形并绘制
         */
        canvas.data = canvas.layers.data
        canvas.drawControlBorder(e.pageX - x, e.pageY - y)
        canvas.data = []
      })
    }
  },
  getters: {}
})
