import React from 'react';
import {View, Text} from 'react-native';
import {Svg, Circle, Polygon, Polyline, Path, Rect, G} from 'react-native-svg';
import AbstractChart from './abstract-chart';

class LineChart extends AbstractChart {
  getColor = (dataset, opacity) => {
    return (dataset.color || this.props.chartConfig.color)(opacity);
  };

  getStrokeWidth = dataset => {
    return dataset.strokeWidth || this.props.chartConfig.strokeWidth || 3;
  };

  getDatas = data =>
    data.reduce((acc, item) => (item.data ? [...acc, ...item.data] : acc), []);

  renderDots = config => {
    const {fillColor, strokeColor, value} = this.props.dotConfig;
    const {
      data,
      width,
      height,
      paddingTop,
      paddingRight,
      onDataPointClick,
    } = config;
    const output = [];
    const datas = this.getDatas(data);
    const baseHeight = this.calcBaseHeight(datas, height);
    data.map((dataset, index) => {
      dataset.data.map((x, i) => {
        const cx =
          paddingRight + (i * (width - paddingRight)) / dataset.data.length;
        const cy =
          ((baseHeight - this.calcHeight(x, datas, height)) / 4) * 3 +
          paddingTop;
        const onPress = () => {
          if (!onDataPointClick) {
            return;
          }

          onDataPointClick({
            index: i,
            value: x,
            dataset,
            getColor: opacity => this.getColor(dataset, opacity),
          });
        };

        output.push(
          <Circle
            key={Math.random()}
            cx={cx}
            cy={cy}
            strokeWidth="5"
            r={x === value ? '10' : '10'}
            stroke={x === value ? strokeColor : 'transparent'}
            fill={x === value ? fillColor : 'transparent'}
            onPress={onPress}
          />,
          // <Circle
          //   key={Math.random()}
          //   cx={cx}
          //   cy={cy}
          //   r="12"
          //   fill="#fff"
          //   fillOpacity={0}
          //   onPress={onPress}
          // />,
        );
      });
    });
    return output;
  };

  renderShadow = config => {
    if (this.props.bezier) {
      return this.renderBezierShadow(config);
    }

    const {data, width, height, paddingRight, paddingTop} = config;
    const output = [];
    const datas = this.getDatas(data);
    const baseHeight = this.calcBaseHeight(datas, height);
    config.data.map((dataset, index) => {
      output.push(
        <Polygon
          key={index}
          points={
            dataset.data
              .map((d, i) => {
                const x =
                  paddingRight +
                  (i * (width - paddingRight)) / dataset.data.length;
                const y =
                  ((baseHeight - this.calcHeight(d, datas, height)) / 4) * 3 +
                  paddingTop;
                return `${x},${y}`;
              })
              .join(' ') +
            ` ${paddingRight +
              ((width - paddingRight) / dataset.data.length) *
                (dataset.data.length - 1)},${(height / 4) * 3 +
              paddingTop} ${paddingRight},${(height / 4) * 3 + paddingTop}`
          }
          fill="url(#fillShadowGradient)"
          strokeWidth={0}
        />,
      );
    });
    return output;
  };

  renderLine = config => {
    if (this.props.bezier) {
      return this.renderBezierLine(config);
    }

    const {width, height, paddingRight, paddingTop, data} = config;
    const output = [];
    const datas = this.getDatas(data);
    const baseHeight = this.calcBaseHeight(datas, height);
    data.forEach((dataset, index) => {
      const points = dataset.data.map((d, i) => {
        const x =
          (i * (width - paddingRight)) / dataset.data.length + paddingRight;
        const y =
          ((baseHeight - this.calcHeight(d, datas, height)) / 4) * 3 +
          paddingTop;
        return `${x},${y}`;
      });

      output.push(
        <Polyline
          key={index}
          points={points.join(' ')}
          fill="none"
          stroke={this.getColor(dataset, 0.2)}
          strokeWidth={this.getStrokeWidth(dataset)}
        />,
      );
    });

    return output;
  };

  getBezierLinePoints = (dataset, config) => {
    const {width, height, paddingRight, paddingTop, data} = config;
    if (dataset.data.length === 0) {
      return 'M0,0';
    }

    const datas = this.getDatas(data);
    const x = i =>
      Math.floor(
        paddingRight + (i * (width - paddingRight)) / dataset.data.length,
      );
    const baseHeight = this.calcBaseHeight(datas, height);
    const y = i => {
      const yHeight = this.calcHeight(dataset.data[i], datas, height);
      return Math.floor(((baseHeight - yHeight) / 4) * 3 + paddingTop);
    };

    return [`M${x(0)},${y(0)}`]
      .concat(
        dataset.data.slice(0, -1).map((_, i) => {
          const x_mid = (x(i) + x(i + 1)) / 2;
          const y_mid = (y(i) + y(i + 1)) / 2;
          const cp_x1 = (x_mid + x(i)) / 2;
          const cp_x2 = (x_mid + x(i + 1)) / 2;
          return (
            `Q ${cp_x1}, ${y(i)}, ${x_mid}, ${y_mid}` +
            ` Q ${cp_x2}, ${y(i + 1)}, ${x(i + 1)}, ${y(i + 1)}`
          );
        }),
      )
      .join(' ');
  };

  renderTooltipElement(config) {
    const {value, valueIcon, rate, rateIcon, date} = this.props.tooltip;
    const {
      data,
      width,
      height,
      paddingTop,
      paddingRight,
      onDataPointClick,
    } = config;
    const output = [];
    const datas = this.getDatas(data);
    const baseHeight = this.calcBaseHeight(datas, height);
    data.map((dataset, index) => {
      dataset.data.map((x, i) => {
        const cx =
          paddingRight + (i * (width - paddingRight)) / dataset.data.length;
        const cy =
          ((baseHeight - this.calcHeight(x, datas, height)) / 4) * 3 +
          paddingTop;
        if (x === value)
          output.push(
            <View
              key={i}
              style={{
                marginTop: cy - 100,
                marginLeft: cx - 83,
              }}>
              <View
                style={{
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  borderRadius: 8,
                  width: 166,
                  height: 82,
                  elevation: 10,
                  paddingHorizontal: 20,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 7,
                  }}>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={{color: '#8992A3'}}>$</Text>
                    <Text>0.082</Text>
                  </View>
                  <View>
                    <Text
                      style={{
                        backgroundColor: 'rgba(246, 57, 45, 0.04)',
                        borderRadius: 4,
                      }}>
                      2.35%
                    </Text>
                  </View>
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 12,
                      lineHeight: 16,
                      color: '#2E3D5C',
                      opacity: 0.4,
                      textAlign: 'center',
                    }}>
                    18.06.2019 at 8:35 pm
                  </Text>
                </View>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    position: 'absolute',
                    bottom: -10,
                    left: 73,
                    borderRadius: 3,
                    zIndex: 2,
                    backgroundColor: 'white',
                    transform: [{rotate: '45deg'}],
                  }}
                />
              </View>
            </View>,
          );
        else null;
      });
    });
    return output;
  }

  renderBezierLine = config => {
    const output = [];
    config.data.map((dataset, index) => {
      const result = this.getBezierLinePoints(dataset, config);
      output.push(
        <Path
          key={index}
          d={result}
          fill="none"
          stroke={this.getColor(dataset, 0.2)}
          strokeWidth={this.getStrokeWidth(dataset)}
        />,
      );
    });
    return output;
  };

  renderBezierShadow = config => {
    const {width, height, paddingRight, paddingTop, data} = config;
    const output = [];
    data.map((dataset, index) => {
      const d =
        this.getBezierLinePoints(dataset, config) +
        ` L${paddingRight +
          ((width - paddingRight) / dataset.data.length) *
            (dataset.data.length - 1)},${(height / 4) * 3 +
          paddingTop} L${paddingRight},${(height / 4) * 3 + paddingTop} Z`;
      output.push(
        <Path
          key={index}
          d={d}
          fill="url(#fillShadowGradient)"
          strokeWidth={0}
        />,
      );
    });
    return output;
  };

  render() {
    const paddingTop = 16;
    const paddingRight = 64;
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
      style = {},
      decorator,
      onDataPointClick,
    } = this.props;
    const {labels = []} = data;
    const {borderRadius = 0} = style;
    const config = {
      width,
      height,
    };
    const datas = this.getDatas(data.datasets);
    return (
      <View style={style}>
        <Svg height={height} width={width}>
          <G>
            {this.renderDefs({
              ...config,
              ...this.props.chartConfig,
            })}
            <Rect
              width="100%"
              height={height}
              rx={borderRadius}
              ry={borderRadius}
              fill="url(#backgroundGradient)"
            />
            <G>
              {withInnerLines
                ? this.renderHorizontalLines({
                    ...config,
                    count: 4,
                    paddingTop,
                    paddingRight,
                  })
                : withOuterLines
                ? this.renderHorizontalLine({
                    ...config,
                    paddingTop,
                    paddingRight,
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
                    paddingRight,
                  })
                : null}
            </G>
            {/*  <G>
              {withInnerLines
                ? this.renderVerticalLines({
                    ...config,
                    data: data.datasets[0].data,
                    paddingTop,
                    paddingRight
                  })
                : withOuterLines
                ? this.renderVerticalLine({
                    ...config,
                    paddingTop,
                    paddingRight
                  })
                : null}
                </G>*/}
            <G>
              {withVerticalLabels
                ? this.renderVerticalLabels({
                    ...config,
                    labels,
                    paddingRight,
                    paddingTop,
                  })
                : null}
            </G>
            <G>
              {this.renderLine({
                ...config,
                paddingRight,
                paddingTop,
                data: data.datasets,
              })}
            </G>
            <G>
              {withShadow &&
                this.renderShadow({
                  ...config,
                  data: data.datasets,
                  paddingRight,
                  paddingTop,
                })}
            </G>
            <G>
              {withDots &&
                this.renderDots({
                  ...config,
                  data: data.datasets,
                  paddingTop,
                  paddingRight,
                  onDataPointClick,
                })}
            </G>
            <G>
              {decorator &&
                decorator({
                  ...config,
                  data: data.datasets,
                  paddingTop,
                  paddingRight,
                })}
            </G>
            {this.props.dotConfig.value && (
              <G>
                {this.renderTooltipElement({
                  ...config,
                  data: data.datasets,
                  paddingTop,
                  paddingRight,
                })}
              </G>
            )}
          </G>
        </Svg>
      </View>
    );
  }
}

export default LineChart;
