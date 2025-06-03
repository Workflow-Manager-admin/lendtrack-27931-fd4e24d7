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
            zIndex: 1290,
            top: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#232837",
            color: "#F2F2F2",
            padding: "10px 18px",
            borderRadius: "10px",
            fontSize: "1rem",
            fontWeight: 500,
            lineHeight: 1.38,
            whiteSpace: "pre-line",
            boxShadow: "0 3px 18px rgba(45,156,219,0.21)",
            minWidth: 168,
            maxWidth: 330,
            textAlign: "center",
            pointerEvents: "none",
            boxSizing: "border-box",
            border: "1.3px solid #2D9CDB"
          }}
        >
          {content}
          <span
            style={{
              position: "absolute",
              top: -10,
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "11px solid transparent",
              borderRight: "11px solid transparent",
              borderBottom: "12px solid #232837"
            }}
            aria-hidden="true"
          />
        </span>
      )}
    </span>
  );
}

export default Tooltip;
