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

  // Replace N/A with - for non-number values
  const formatText = (value) => {
    if (value === "N/A" || value === "n/a" || value === null || value === undefined) {
      return "-";
    }
    return value;
  };

  // If translate is true, try to translate the text
  const displayText = translate ? t(formatText(text), formatText(text)) : formatText(text);
  const displaySubtext = translate && subtext ? t(formatText(subtext), formatText(subtext)) : formatText(subtext);

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
