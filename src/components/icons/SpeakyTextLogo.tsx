import React from "react";

const SpeakyTextLogo = ({
  width,
  height,
  className,
}: {
  width?: number;
  height?: number;
  className?: string;
}) => {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 400 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="200"
        y="58"
        textAnchor="middle"
        className="fill-text"
        style={{
          fontSize: "64px",
          fontFamily:
            "ui-rounded, 'Hiragino Maru Gothic ProN', Quicksand, Comfortaa, Manjari, 'Arial Rounded MT', 'Arial Rounded MT Bold', Calibri, source-sans-pro, sans-serif",
          fontWeight: 700,
          letterSpacing: "-1px",
        }}
      >
        Speaky
      </text>
    </svg>
  );
};

export default SpeakyTextLogo;
