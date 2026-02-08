const SpeakyBubble = ({
  width,
  height,
}: {
  width?: number | string;
  height?: number | string;
}) => (
  <svg
    width={width || 126}
    height={height || 135}
    viewBox="0 0 126 135"
    className="fill-text stroke-text"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Speech bubble */}
    <path
      d="M63 12C33.2 12 9 31.3 9 55.2c0 13.3 7.2 25.2 18.5 33.3L22 108l22.5-11.3c5.8 1.7 12 2.6 18.5 2.6 29.8 0 54-19.3 54-43.1S92.8 12 63 12z"
      strokeWidth="6"
      strokeLinejoin="round"
    />
    {/* Sound waves */}
    <path
      d="M53 48v18M63 40v34M73 48v18"
      fill="none"
      strokeWidth="6"
      strokeLinecap="round"
    />
  </svg>
);

export default SpeakyBubble;
