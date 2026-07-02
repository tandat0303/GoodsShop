interface LoadingProps {
  size?: number;
  fullScreen?: boolean;
  overlay?: boolean;
}

export default function Loading({
  fullScreen = false,
  overlay = false,
}: LoadingProps) {
  return (
    <div
      className={`${fullScreen || overlay ? "fixed" : "relative"} inset-0 flex flex-col justify-center items-center z-9999 ${
        overlay
          ? "bg-white/85 dark:bg-[#0d1117]/85"
          : "bg-white dark:bg-[#0d1117]"
      }`}
    >
      <svg
        viewBox="0 0 200 220"
        width="210"
        height="231"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="100"
          cy="100"
          r="88"
          fill="none"
          className="stroke-[#E0E7FF] dark:stroke-[#30363d]"
          strokeWidth="3"
        />

        <circle
          cx="100"
          cy="100"
          r="88"
          fill="none"
          stroke="#6366F1"
          strokeWidth="3"
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
          strokeDasharray="553"
          strokeDashoffset="553"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="553"
            to="0"
            dur="1.5s"
            begin="0.2s"
            fill="freeze"
            calcMode="spline"
            keySplines="0.4 0 0.2 1"
            keyTimes="0;1"
          />
        </circle>

        <rect
          x="36"
          y="48"
          width="128"
          height="82"
          rx="7"
          fill="none"
          className="stroke-[#C7D2FE] dark:stroke-[#30363d]"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        <rect
          x="46"
          y="57"
          width="108"
          height="64"
          rx="3"
          fill="none"
          className="stroke-[#C7D2FE] dark:stroke-[#30363d]"
          strokeWidth="1.5"
          opacity="0.5"
        />

        <line
          x1="100"
          y1="130"
          x2="100"
          y2="148"
          className="stroke-[#C7D2FE] dark:stroke-[#30363d]"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        <line
          x1="70"
          y1="150"
          x2="130"
          y2="150"
          className="stroke-[#C7D2FE] dark:stroke-[#30363d]"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        <rect
          x="36"
          y="48"
          width="128"
          height="82"
          rx="7"
          fill="none"
          stroke="#6366F1"
          strokeWidth="3.5"
          strokeLinejoin="round"
          strokeDasharray="380"
          strokeDashoffset="380"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="380"
            to="0"
            dur="1.2s"
            begin="1.8s"
            fill="freeze"
            calcMode="spline"
            keySplines="0.4 0 0.2 1"
            keyTimes="0;1"
          />
        </rect>

        <rect
          x="46"
          y="57"
          width="108"
          height="64"
          rx="3"
          fill="none"
          stroke="#6366F1"
          strokeWidth="1.5"
          strokeDasharray="348"
          strokeDashoffset="348"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="348"
            to="0"
            dur="1.0s"
            begin="2.0s"
            fill="freeze"
            calcMode="spline"
            keySplines="0.4 0 0.2 1"
            keyTimes="0;1"
          />
        </rect>

        <line
          x1="100"
          y1="130"
          x2="100"
          y2="148"
          stroke="#6366F1"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="18"
          strokeDashoffset="18"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="18"
            to="0"
            dur="0.4s"
            begin="2.3s"
            fill="freeze"
          />
        </line>

        <line
          x1="70"
          y1="150"
          x2="130"
          y2="150"
          stroke="#6366F1"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="60"
          strokeDashoffset="60"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="60"
            to="0"
            dur="0.5s"
            begin="2.55s"
            fill="freeze"
          />
        </line>
      </svg>

      <p
        className="text-slate-500 dark:text-[#8b95a8]"
        style={{
          marginTop: 14,
          fontSize: 16,
          fontWeight: 500,
          letterSpacing: "0.02em",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Đang thiết lập ứng dụng
        <span
          style={{
            animation: "ly-dots 1.4s ease 0.7s infinite",
            display: "inline-block",
          }}
        >
          .
        </span>
        <span
          style={{
            animation: "ly-dots 1.4s ease 0.9s infinite",
            display: "inline-block",
          }}
        >
          .
        </span>
        <span
          style={{
            animation: "ly-dots 1.4s ease 1.1s infinite",
            display: "inline-block",
          }}
        >
          .
        </span>
        <style>{`
          @keyframes ly-dots {
            0%,80%,100% { opacity: 0.2; }
            40% { opacity: 1; }
          }
        `}</style>
      </p>
    </div>
  );
}
