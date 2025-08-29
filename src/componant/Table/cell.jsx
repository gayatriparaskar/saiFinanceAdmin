import React from "react";
import classNames from "classnames";
import { useLocalTranslation } from "../../hooks/useLocalTranslation";

const Cell = ({
  text = "",
  subtext = "",
  onClick,
  bold = "normal",
  translate = false
}) => {
  const { t } = useLocalTranslation();

  // If translate is true, try to translate the text
  const displayText = translate ? t(text, text) : text;
  const displaySubtext = translate && subtext ? t(subtext, subtext) : subtext;

  return (
    <div
      onClick={onClick}
      className={classNames({ "cursor-pointer": onClick })}
    >
      <div className={`font-${bold} text-black`}>{displayText}</div>
      {displaySubtext && <div className="text-gray-600 text-xs">{displaySubtext}</div>}
    </div>
  );
};

export default Cell;
