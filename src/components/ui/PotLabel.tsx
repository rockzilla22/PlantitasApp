export function PotLabel() {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
      <svg
        viewBox="0 0 250 250"
        width="12"
        height="12"
        style={{
          fillRule: "evenodd",
          clipRule: "evenodd",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeMiterlimit: 1.5,
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        <path
          d="M229.615,66.124L204.275,244.75L45.725,244.75L20.385,66.124L229.615,66.124ZM172,5.25L11.75,5.25L172,5.25Z"
          style={{ fill: "rgb(205,97,29)", stroke: "black", strokeWidth: "7.5px" }}
        />
        <path
          d="M21.52,74.124L20.385,66.124L229.615,66.124L204.275,244.75L168.41,244.75L192.615,74.124L21.52,74.124Z"
          style={{ fill: "rgb(161,81,31)" }}
        />
        <path
          d="M229.615,66.124L204.275,244.75L45.725,244.75L20.385,66.124L229.615,66.124ZM172,5.25L11.75,5.25L172,5.25Z"
          style={{ fill: "none", stroke: "black", strokeWidth: "7.5px" }}
        />
        <g transform="matrix(1.06402,0,0,1,-8.00217,0)">
          <path
            d="M20.385,66.124L11.75,5.25L238.25,5.25L229.615,66.124L20.385,66.124Z"
            style={{ fill: "rgb(205,97,29)", stroke: "black", strokeWidth: "7.26px" }}
          />
        </g>
        <path
          d="M4.5,5.25L245.5,5.25L236.312,66.124L199.312,66.124L208.5,5.25L4.5,5.25Z"
          style={{ fill: "rgb(161,81,31)" }}
        />
        <g transform="matrix(1.06402,0,0,1,-8.00217,0)">
          <path
            d="M20.385,66.124L11.75,5.25L238.25,5.25L229.615,66.124L20.385,66.124Z"
            style={{ fill: "none", stroke: "black", strokeWidth: "7.26px" }}
          />
        </g>
      </svg>
      <span>Maceta</span>
    </label>
  );
}