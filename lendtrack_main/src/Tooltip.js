import React, { useState, useRef } from "react";

/**
 * PUBLIC_INTERFACE
 * Accessible Tooltip component for React.
 * Props:
 * - content: Tooltip text/content to show.
 * - children: The element to be wrapped with tooltip.
 * 
 * Tooltip appears on hover or focus (keyboard accessible).
 * Also supports tap/click for mobile: toggles tooltip.
 */
function Tooltip({ content, children }) {
  const [visible, setVisible] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const childRef = useRef(null);

  // Announce tooltip for screen readers
  const tooltipId = "lt-tooltip-" + Math.random().toString(36).slice(2, 10);

  // Show on hover/focus or touch/click
  const showTooltip = () => setVisible(true);
  const hideTooltip = () => {
    setVisible(false);
    setKeyboardFocus(false);
  };

  // For keyboard/tab focus
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setVisible(false);
      setKeyboardFocus(false);
      if (childRef.current) childRef.current.blur();
    }
  };

  // For tap (shows until tap/click elsewhere)
  const handleClick = (e) => {
    e.stopPropagation();
    setVisible((v) => !v);
  };

  // Hide on outside click (mobile)
  React.useEffect(() => {
    if (!visible) return;
    const handleDoc = (e) => {
      setVisible(false);
      setKeyboardFocus(false);
    };
    document.addEventListener("mousedown", handleDoc, { capture: true });
    document.addEventListener("touchstart", handleDoc, { capture: true });
    return () => {
      document.removeEventListener("mousedown", handleDoc, { capture: true });
      document.removeEventListener("touchstart", handleDoc, { capture: true });
    };
  }, [visible]);

  // Only clone element if possible
  const triggerProps = {
    ref: childRef,
    tabIndex: 0,
    "aria-describedby": visible ? tooltipId : undefined,
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip,
    onFocus: (e) => { showTooltip(); setKeyboardFocus(true); },
    onBlur: hideTooltip,
    onKeyDown: handleKeyDown,
    onClick: handleClick, // for mobile/touch or desktop click
    style: { outline: keyboardFocus ? "2px solid #2D9CDB" : undefined, cursor: "pointer"}
  };

  return (
    <span style={{ display: "inline-block", position: "relative" }}>
      {React.isValidElement(children)
        ? React.cloneElement(children, triggerProps)
        : <span {...triggerProps}>{children}</span>
      }
      {visible && (
        <span
          id={tooltipId}
          role="tooltip"
          style={{
            position: "absolute",
            zIndex: 999,
            top: "calc(100% + 7px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#232837",
            color: "#fff",
            padding: "7px 14px",
            borderRadius: "7px",
            fontSize: "0.96rem",
            fontWeight: 400,
            whiteSpace: "pre-line",
            boxShadow: "0 2px 10px rgba(0,0,0,0.19)",
            minWidth: 195,
            maxWidth: 300,
            textAlign: "center",
            pointerEvents: "none"
          }}
        >
          {content}
          <span
            style={{
              position: "absolute",
              top: -7,
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "7px solid transparent",
              borderRight: "7px solid transparent",
              borderBottom: "7px solid #232837"
            }}
            aria-hidden="true"
          />
        </span>
      )}
    </span>
  );
}

export default Tooltip;
