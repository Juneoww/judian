/**
 * 功能:
 *   渲染“聚点”广佛地图概览，并在可编辑模式下把用户点按转换为最近的站点附近位置。
 * 实现:
 *   使用相对坐标绘制演示站点、已提交成员与候选地点；点按空白地图时计算最近站点并派发 pointchange 事件。
 * 输入:
 *   points、memberPins、candidatePins、interactive 与 compact 组件属性，以及触摸事件坐标。
 * 输出:
 *   视觉地图和 { pointId, source } 自定义事件；不持久化数据、不请求真实地图服务。
 * 依赖:
 *   微信小程序 Component、wx.createSelectorQuery 和 WXSS。
 * 用法:
 *   <city-map points="{{points}}" interactive="{{true}}" bind:pointchange="onMapPointChange" />
 */

Component({
  properties: {
    points: {
      type: Array,
      value: []
    },
    memberPins: {
      type: Array,
      value: []
    },
    candidatePins: {
      type: Array,
      value: []
    },
    interactive: {
      type: Boolean,
      value: false
    },
    compact: {
      type: Boolean,
      value: false
    }
  },

  methods: {
    handlePointTap(event) {
      if (!this.data.interactive) {
        return;
      }

      this.triggerEvent('pointchange', {
        pointId: event.currentTarget.dataset.pointId,
        source: 'station-marker'
      });
    },

    handleMapTap(event) {
      if (!this.data.interactive || !this.data.points.length) {
        return;
      }

      const touch = (event.touches && event.touches[0])
        || (event.changedTouches && event.changedTouches[0])
        || event.detail;
      if (!touch) {
        return;
      }

      wx.createSelectorQuery()
        .in(this)
        .select('.map-canvas')
        .boundingClientRect((rect) => {
          if (!rect || !rect.width || !rect.height) {
            return;
          }

          const clientX = Number(touch.clientX === undefined ? touch.x : touch.clientX);
          const clientY = Number(touch.clientY === undefined ? touch.y : touch.clientY);
          const relativeX = ((clientX - rect.left) / rect.width) * 100;
          const relativeY = ((clientY - rect.top) / rect.height) * 100;
          const closestPoint = this.data.points.reduce((closest, point) => {
            const pointDistance = Math.pow(point.x - relativeX, 2) + Math.pow(point.y - relativeY, 2);
            const closestDistance = Math.pow(closest.x - relativeX, 2) + Math.pow(closest.y - relativeY, 2);
            return pointDistance < closestDistance ? point : closest;
          });

          this.triggerEvent('pointchange', {
            pointId: closestPoint.id,
            source: 'map-area'
          });
        })
        .exec();
    }
  }
});
