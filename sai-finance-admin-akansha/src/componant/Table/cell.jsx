import React from "react";
import classNames from "classnames";

const Cell = ({
  text = "",
  subtext = "",
  onClick,
  bold = "normal"
}) => {
  return (
    <div
      onClick={onClick}
      className={classNames({ "cursor-pointer": onClick })}
    >
      <div className={`font-${bold} text-black`}>{text}</div>
      {subtext && <div className="text-gray-600 text-xs">{subtext}</div>}
    </div>
  );
};

export default Cell;
