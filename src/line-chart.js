import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Svg, Circle, Polygon, Polyline, Path, Rect, G } from "react-native-svg"
import AbstractChart from "./abstract-chart"
import _ from "lodash"

class LineChart extends AbstractChart {
  getColor = (dataset, opacity) => {
    return (dataset.color || this.props.chartConfig.color)(opacity)
  }
  getStrokeWidth = dataset => {
    return dataset.strokeWidth || this.props.chartConfig.strokeWidth || 3
  }
  getDatas = data =>
    data.reduce((acc, item) => (item.data ? [...acc, ...item.data] : acc), [])
  calculateLine(maxPrice, minPrice, price, minCy) {
    if (result !== Infinity) return result
    return 0
  }
  renderPriceTool = config => {
    const { data, height, paddingTop, priceData, priceConfig } = config
    const output = []
    const datas = this.getDatas(data)
    const baseHeight = this.calcBaseHeight(datas, height)
    let maxCy = 0
    let minCy = 99999999999
    data[0].data.forEach((x, i) => {
      const cy =
        ((baseHeight - this.calcHeight(x, datas, height)) / 4) * 3 + paddingTop
      if (cy < minCy) minCy = cy
      if (cy > maxCy) maxCy = cy
    })
    
    priceData.map((item, i) => {
     if(item.price && priceConfig.maxPrice>=item.price && priceConfig.minPrice<=item.price) {
        const yLine = (item.price * minCy) / priceConfig.maxPrice
        const color =
          item.status === 1
            ? "#14C91B"
            : item.status === 2
            ? "#F6392D"
            : "#FEB932"
        output.push (
          <View
            key={i}
            style={{
              position: "absolute",
              left: 16,
              top: yLine,
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              zIndex: 99999
            }}
          >
            <View
              style={{
                width: 30,
                height: 20,
                borderRadius: 4,
                backgroundColor: color,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Text style={{ color: "white", fontSize: 7, width: 22 }}>
                {item.price}
              </Text>
              <View
                style={{
                  width: 7,
                  height: 7,
                  backgroundColor: color,
                  position: "absolute",
                  top: 7,
                  right: -2,
                  transform: [{ rotate: "45deg" }]
                }}
              />
            </View>
            <View
              style={{
                width: "90%",
                height: 1,
                backgroundColor: color
              }}
            />
          </View>
        )
      }
    })
    return output
  }
  renderTooltipElement(config) {
    const { clickedPoint, dotR } = this.props
    const { data, width, height, paddingTop, paddingRight, labels } = config
    const output = []
    const datas = this.getDatas(data)
    const baseHeight = this.calcBaseHeight(datas, height)
    data.map((dataset, index) => {
      dataset.data.map((x, i) => {
        const cx =
          i === 0
            ? paddingRight +
              (i * (width - paddingRight)) / (dataset.data.length - 1)
            : i === dataset.data.length - 1
            ? paddingRight +
              (i * (width - paddingRight)) / (dataset.data.length - 1)
            : paddingRight +
              (i * (width - paddingRight)) / (dataset.data.length - 1)
        const cy =
          ((baseHeight - this.calcHeight(x, datas, height)) / 4) * 3 +
          paddingTop
        if (x.toString() + "+" + labels[i] === clickedPoint)
          output.push(
            <View
              key={i}
              style={{
                marginTop: cy,
                marginLeft: dataset.data.length - 1 === i ? cx - 3 : cx
              }}
            >
              {this.props.tooltip}
            </View>
          )
      })
    })
    return output
  }
  renderDots = config => {
    const {
      data,
      width,
      height,
      paddingTop,
      paddingRight,
      onDataPointClick,
      labels
    } = config
    const { dotFillColor, dotStrokeWidth, dotR } = this.props.chartConfig
    const { clickedPoint } = this.props
    const output = []
    const datas = this.getDatas(data)
    const baseHeight = this.calcBaseHeight(datas, height)
    data.map((dataset, index) => {
      dataset.data.map((x, i) => {
        const cyPosFirst =
          dataset.data.length !== 0 && x < dataset.data[i + 1]
            ? 0 - dotR / 2
            : dotR
        const cyPosLast = -dotR / 2
        const cx =
          i === 0
            ? paddingRight +
              dotR +
              (i * (width - paddingRight)) / (dataset.data.length - 1)
            : i === dataset.data.length - 1
            ? paddingRight -
              dotR / 2 +
              (i * (width - paddingRight)) / (dataset.data.length - 1)
            : paddingRight +
              (i * (width - paddingRight)) / (dataset.data.length - 1)
        const cy =
          i === 0
            ? ((baseHeight - this.calcHeight(x, datas, height)) / 4) * 3 +
              paddingTop +
              cyPosFirst
            : i === dataset.data.length - 1
            ? ((baseHeight - this.calcHeight(x, datas, height)) / 4) * 3 +
              paddingTop +
              cyPosLast
            : ((baseHeight - this.calcHeight(x, datas, height)) / 4) * 3 +
              paddingTop
        const onPress = () => {
          if (!onDataPointClick) {
            return
          }
          onDataPointClick({
            index: i,
            value: x.toString(),
            dataset,
            getColor: opacity => this.getColor(dataset, opacity),
            label: labels[i],
            cx: cx
          })
        }
        const circlePoint = x.toString() + "+" + labels[i]
        output.push(
          <Circle
            key={Math.random()}
            cx={cx}
            cy={cy}
            r={dotR}
            strokeWidth={dotStrokeWidth}
            fill={circlePoint === clickedPoint ? dotFillColor : "transparent"}
            stroke={
              circlePoint === clickedPoint
                ? this.getColor(dataset, 0.9)
                : "transparent"
            }
            onPress={onPress}
          />,
          <Circle
            key={Math.random()}
            cx={cx}
            cy={cy}
            r="12"
            fill="#fff"
            fillOpacity={0}
            onPress={onPress}
          />
        )
      })
    })
    return output
  }
  renderShadow = config => {
    if (this.props.bezier) {
      return this.renderBezierShadow(config)
    }
    const { data, width, height, paddingRight, paddingTop } = config
    const output = []
    const datas = this.getDatas(data)
    const baseHeight = this.calcBaseHeight(datas, height)
    config.data.map((dataset, index) => {
      output.push(
        <Polygon
          key={index}
          points={
            dataset.data
              .map((d, i) => {
                const x =
                  paddingRight +
                  (i * (width - paddingRight)) / dataset.data.length
                const y =
                  ((baseHeight - this.calcHeight(d, datas, height)) / 4) * 3 +
                  paddingTop
                return `${x},${y}`
              })
              .join(" ") +
            ` ${paddingRight +
              ((width - paddingRight) / dataset.data.length) *
                (dataset.data.length - 1)},${(height / 4) * 3 +
              paddingTop} ${paddingRight},${(height / 4) * 3 + paddingTop}`
          }
          fill="url(#fillShadowGradient)"
          strokeWidth={0}
        />
      )
    })
    return output
  }
  renderLine = config => {
    if (this.props.bezier) {
      return this.renderBezierLine(config)
    }
    const { width, height, paddingRight, paddingTop, data } = config
    const output = []
    const datas = this.getDatas(data)
    const baseHeight = this.calcBaseHeight(datas, height)
    data.forEach((dataset, index) => {
      const points = dataset.data.map((d, i) => {
        const x =
          (i * (width - paddingRight)) / dataset.data.length + paddingRight
        const y =
          ((baseHeight - this.calcHeight(d, datas, height)) / 4) * 3 +
          paddingTop
        return `${x},${y}`
      })
      output.push(
        <Polyline
          key={index}
          points={points.join(" ")}
          fill="none"
          stroke={this.getColor(dataset, 0.2)}
          strokeWidth={this.getStrokeWidth(dataset)}
        />
      )
    })
    return output
  }
  getBezierLinePoints = (dataset, config) => {
    const { width, height, paddingRight, paddingTop, data } = config
    if (dataset.data.length === 0) {
      return "M0,0"
    }
    const datas = this.getDatas(data)
    const x = i =>
      Math.floor(
        paddingRight + (i * (width - paddingRight)) / (dataset.data.length - 1)
      )
    const baseHeight = this.calcBaseHeight(datas, height)
    const y = i => {
      const yHeight = this.calcHeight(dataset.data[i], datas, height)
      return Math.floor(((baseHeight - yHeight) / 4) * 3 + paddingTop)
    }
    return [`M${x(0)},${y(0)}`]
      .concat(
        dataset.data.slice(0, -1).map((_, i) => {
          const x_mid = (x(i) + x(i + 1)) / 2
          const y_mid = (y(i) + y(i + 1)) / 2
          const cp_x1 = (x_mid + x(i)) / 2
          const cp_x2 = (x_mid + x(i + 1)) / 2
          return (
            `Q ${cp_x1}, ${y(i)}, ${x_mid}, ${y_mid}` +
            ` Q ${cp_x2}, ${y(i + 1)}, ${x(i + 1)}, ${y(i + 1)}`
          )
        })
      )
      .join(" ")
  }
  renderBezierLine = config => {
    const output = []
    config.data.map((dataset, index) => {
      const result = this.getBezierLinePoints(dataset, config)
      output.push(
        <Path
          key={index}
          d={result}
          fill="none"
          stroke={this.getColor(dataset, 0.2)}
          strokeWidth={this.getStrokeWidth(dataset)}
        />
      )
    })
    return output
  }
  renderBezierShadow = config => {
    const { width, height, paddingRight, paddingTop, data } = config
    const output = []
    data[0].data.length !== 0 &&
      data.map((dataset, index) => {
        const d =
          this.getBezierLinePoints(dataset, config) +
          ` L${paddingRight +
            ((width - paddingRight) / dataset.data.length) *
              dataset.data.length},${(height / 4) * 3 +
            paddingTop} L${paddingRight},${(height / 4) * 3 + paddingTop} Z`
        output.push(
          index === 0 ? (
            <Path
              key={index}
              d={d}
              fill="url(#fillShadowGradient)"
              strokeWidth={0}
            />
          ) : (
            <Path key={index} d={d} fill="transparent" strokeWidth={0} />
          )
        )
      })
    return output
  }
  render() {
    const paddingRight = 0
    const {
      width,
      height,
      data,
      withShadow = true,
      withDots = true,
      withInnerLines = true,
      withOuterLines = true,
      withHorizontalLabels = true,
      withVerticalLabels = true,
      withHorizontalInnerLines = false,
      style = {},
      decorator,
      onDataPointClick,
      clickedPoint,
      priceData,
      priceConfig,
      paddingTop = 16
    } = this.props
    const { labels = [] } = data
    const { borderRadius = 0 } = style
    const config = {
      width,
      height
    }
    const datas = this.getDatas(data.datasets)
    const { transparent } = this.props
    return (
      <View style={[style, { width: width, height: height }]}>
        <Svg height={height} width={width}>
          <G>
            {this.renderDefs({
              ...config,
              ...this.props.chartConfig
            })}
            <Rect
              width="100%"
              height={height}
              rx={borderRadius}
              ry={borderRadius}
              fill={transparent ? "none" : "url(#backgroundGradient)"}
            />
            <G>
              {withInnerLines || withHorizontalInnerLines
                ? this.renderHorizontalLines({
                    ...config,
                    count: 4,
                    paddingTop,
                    paddingRight
                  })
                : withOuterLines
                ? this.renderHorizontalLine({
                    ...config,
                    paddingTop,
                    paddingRight
                  })
                : null}
            </G>
            <G>
              {withHorizontalLabels
                ? this.renderHorizontalLabels({
                    ...config,
                    count: Math.min(...datas) === Math.max(...datas) ? 1 : 4,
                    data: datas,
                    paddingTop,
                    paddingRight
                  })
                : null}
            </G>
            <G>
              {withInnerLines
                ? this.renderVerticalLines({
                    ...config,
                    data: data.datasets[0].data,
                    paddingTop,
                    paddingRight,
                    labels: labels
                  })
                : withOuterLines
                ? this.renderVerticalLine({
                    ...config,
                    paddingTop,
                    paddingRight
                  })
                : null}
            </G>
            <G>
              {withVerticalLabels
                ? this.renderVerticalLabels({
                    ...config,
                    labels,
                    paddingRight,
                    paddingTop
                  })
                : null}
            </G>
            <G>
              {this.renderLine({
                ...config,
                paddingRight,
                paddingTop,
                data: data.datasets
              })}
            </G>
            <G>
              {withShadow &&
                this.renderShadow({
                  ...config,
                  data: data.datasets,
                  paddingRight,
                  paddingTop
                })}
            </G>
            <G>
              {withDots &&
                this.renderDots({
                  ...config,
                  data: data.datasets,
                  labels: labels,
                  paddingTop,
                  paddingRight,
                  onDataPointClick
                })}
            </G>
            <G>
              {decorator &&
                decorator({
                  ...config,
                  data: data.datasets,
                  paddingTop,
                  paddingRight
                })}
            </G>
            {clickedPoint && (
              <G>
                {this.renderTooltipElement({
                  ...config,
                  data: data.datasets,
                  labels: labels,
                  paddingTop,
                  paddingRight
                })}
              </G>
            )}
          </G>
        </Svg>
        {!_.isEmpty(priceData) &&
          this.renderPriceTool({
            ...config,
            data: data.datasets,
            labels: labels,
            paddingTop,
            paddingRight,
            priceConfig,
            priceData
          })}
      </View>
    )
  }
}
export default LineChart
