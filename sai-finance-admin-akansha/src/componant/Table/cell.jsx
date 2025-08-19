import React from "react";
import classNames from "classnames";

<<<<<<< HEAD
const Cell = ({ 
  text = "", 
  subtext = "", 
  onClick,
  bold = "normal" 
}) => {
=======
const Cell = ({ text = "", subtext = "", onClick = null, bold = "normal" }) => {
>>>>>>> refs/remotes/origin/main
  return (
    <div
      onClick={onClick}
      className={classNames({ "cursor-pointer": onClick })}
    >
      <div className={`font-${bold} text-black`}>{text}</div>
      <div className="text-gray-500 text-sm">{subtext}</div>
    </div>
  );
};

export default Cell;
