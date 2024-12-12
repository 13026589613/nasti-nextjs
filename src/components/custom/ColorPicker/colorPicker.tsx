import "./colorPicker.sass";

import { useSetState } from "ahooks";
import { useEffect, useState } from "react";
import { SketchPicker } from "react-color";
import { useColor } from "react-color-palette";
import reactCSS from "reactcss";
interface SketchExampleProps {
  onChange: (color: string) => void;
  value: string;
}

const SketchExample = (props: SketchExampleProps) => {
  const { onChange, value } = props;

  const [hexColor, setHexColor] = useColor(value || "#000000");
  const [color, setColor] = useSetState<any>("rgba(0,0,0,1)");
  const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false);
  useEffect(() => {
    setColor(hexColor);
  }, [value]);
  const handleChange = (color: any) => {
    setHexColor(color.rgb);
    setColor(color);
  };
  const handleChangeComplete = (color: any) => {
    if (color) {
      if (color.rgb.a !== 1) {
        onChange(
          `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`
        );
      } else {
        onChange(color.hex);
      }
    }
  };
  const handleClick = () => {
    setDisplayColorPicker(!displayColorPicker);
  };
  const handleClose = () => {
    setDisplayColorPicker(false);
  };
  const styles = reactCSS({
    default: {
      color: {
        width: "18px",
        height: "18px",
        zIndex: "999",
      },
      swatch: {
        cursor: "pointer",
      },
      popover: {
        position: "absolute",
        zIndex: "2",
      },
      cover: {
        position: "fixed",
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
    },
  });
  return (
    <div>
      {displayColorPicker && (
        <div
          style={{
            position: "fixed",
            top: "0px",
            right: "0px",
            bottom: "0px",
            left: "0px",
            zIndex: "1",
            background: "rgba(0,0,0,0.1)",
          }}
          onClick={handleClose}
        />
      )}

      <div style={styles.swatch} onClick={handleClick}>
        <div
          style={{
            ...styles.color,
            backgroundColor:
              color && color.rgb
                ? `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`
                : color && color.hex
                ? color.hex
                : "#000000",
          }}
        />
      </div>
      {displayColorPicker && (
        <div
          style={{
            position: "fixed",
            zIndex: "2",
            // right: "40px",
            marginTop: "20px",
          }}
        >
          <SketchPicker
            color={color.rgb}
            onChange={handleChange}
            onChangeComplete={handleChangeComplete}
            presetColors={[
              "#FF1A00",
              "#F44E3B",
              "#FE9200",
              "#FCDC00",
              "#DBDF00",
              "#A4DD00",
              "#68CCCA",
              "#73D8FF",
              "#AEA1FF",
              "#FDA1FF",
              "#A71900",
              "#D33115",
              "#E27300",
              "#FCC400",
              "#B0BC00",
              "#68BC00",
              "#16A5A5",
              "#77A9F2",
              "#7B64FF",
              "#FA28FF",
            ]}
          ></SketchPicker>
        </div>
      )}
    </div>
  );
};

export default SketchExample;
