import React, { useState } from "react";
import { useInterval } from "usehooks-ts";

import { FILLS } from "./Logo";

interface LoadingProps {
  spin: boolean;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = React.memo(function Loading({
  spin,
  className,
}: LoadingProps) {
  const [offset, setOffset] = useState(0);

  useInterval(() => {
    setOffset((o) => (o + 1) % FILLS.length);
  }, 1000);

  const fill = FILLS[offset];

  return (
    <svg
      key={fill}
      className={`${className ?? "w-1/4"} ${spin ? "animate-spin" : ""}`}
      x="0px"
      y="0px"
      viewBox="0 0 1000 1000"
      enableBackground="new 0 0 1000 1000"
    >
      <g transform="translate(0.000000,511.000000) scale(0.100000,-0.100000)">
        <path
          className={fill}
          d="M6026.9,5001.8c-400.3-68.1-636-161.8-894.4-352.1c-542.3-400.4-956.9-1030.7-1533.3-2328.3C3105.1,1214,3076.7,1160,2338.5,177.6c-576.4-772.3-814.9-1130.1-1010.8-1533.3c-357.8-726.9-431.6-1260.7-249.9-1803c96.5-295.3,238.5-516.8,491.2-766.6c383.3-386.2,885.9-670.1,1408.4-800.7c354.9-85.2,956.9-85.2,1365.8,0C6566.4-4251.9,8554-1909.4,8968.5,717.1c65.3,414.6,65.3,1203.9,2.9,1575.9c-153.3,894.4-539.5,1610-1127.3,2081.3c-275.4,221.5-761,471.3-1079,559.4C6555,4990.4,6166,5027.3,6026.9,5001.8z M6606.2,4521.9c227.1-59.6,417.4-142,681.5-295.3c837.6-488.4,1294.8-1436.8,1294.8-2688.9c0-874.5-201.6-1712.1-621.8-2581c-831.9-1726.4-2294.2-2992.8-3765.1-3265.3c-315.2-59.6-934.2-45.4-1192.6,25.6c-607.6,167.5-1235.2,650.2-1459.5,1121.6c-88,190.3-102.2,247-110.7,485.5c-17,445.8,102.2,834.8,437.3,1411.2C2057.4-944,2284.6-620.3,2949,268.4c448.6,599.1,562.2,795,931.3,1618.5c525.3,1164.2,687.1,1470.8,1016.5,1902.4c289.6,383.3,602,624.7,945.5,735.4C5998.5,4575.8,6407.4,4573,6606.2,4521.9z"
        />
        <path
          className={fill}
          d="M6776.5,3616.1c-99.4-42.6-124.9-90.9-124.9-230c0-110.7,105.1-213,218.6-213c90.9,0,235.7,144.8,235.7,238.5c0,79.5-99.4,204.5-184.6,227.2C6890.1,3647.4,6824.8,3636,6776.5,3616.1z"
        />
        <path
          className={fill}
          d="M5635.1,3440.1c-90.9-62.5-122.1-161.8-88-266.9c36.9-102.2,102.2-142,235.7-142c227.2,0,292.5,326.5,82.3,423.1C5771.3,3496.9,5708.9,3494,5635.1,3440.1z"
        />
        <path
          className={fill}
          d="M6733.9,2068.6c-93.7-93.7-99.4-142-39.8-255.5c53.9-110.7,181.7-147.7,312.3-99.4c65.3,25.6,136.3,176,116.4,255.6C7074.7,2153.8,6873,2204.9,6733.9,2068.6z"
        />
        <path
          className={fill}
          d="M5771.3,2085.7c-90.9-45.4-147.7-167.5-124.9-258.4c42.6-178.9,278.3-232.8,397.5-90.9c85.2,96.5,85.2,193.1,5.7,283.9C5970.1,2108.4,5865,2133.9,5771.3,2085.7z"
        />
        <path
          className={fill}
          d="M4473.7,1390c-82.3-11.4-178.9-136.3-178.9-224.3c0-90.9,144.8-235.7,235.7-235.7c36.9,0,102.2,25.5,139.1,56.8C4862.7,1137.3,4717.9,1429.8,4473.7,1390z"
        />
        <path
          className={fill}
          d="M5473.2,773.9c-150.5-147.7-51.1-383.3,161.9-383.3c198.8,0,292.4,244.2,150.5,383.3c-42.6,45.4-102.2,71-156.2,71C5575.4,844.8,5515.8,819.3,5473.2,773.9z"
        />
        <path
          className={fill}
          stroke="#732982"
          d="M4536.2-390.3c-193.1-190.3,71-494,292.5-337.9c90.9,62.4,122.1,161.8,88,266.9C4859.9-305.1,4658.3-265.4,4536.2-390.3z"
        />
        <path
          className={fill}
          stroke="#732982"
          d="M3443-540.8c-99.4-99.4-107.9-195.9-28.4-298.1c110.7-139.1,312.3-119.3,380.5,39.8c68.1,161.8-2.8,292.4-176,326.5C3545.2-458.4,3516.9-469.8,3443-540.8z"
        />
        <path
          className={fill}
          stroke="#732982"
          d="M4621.4-1829.9c-142-76.6-170.4-230-62.5-346.4c144.8-161.9,389-73.8,389,139.1C4947.9-1855.4,4774.7-1744.7,4621.4-1829.9z"
        />
        <path
          className={fill}
          stroke="#732982"
          d="M3531.1-1926.4c-99.4-127.8-73.8-269.7,56.8-337.9c113.6-59.6,187.4-53.9,266.9,28.4c90.9,88,96.5,244.2,14.2,326.5C3780.9-1821.4,3604.9-1832.7,3531.1-1926.4z"
        />
        <path
          className={fill}
          stroke="#732982"
          d="M2199.4-2627.8c-85.2-90.9-82.4-230,8.5-318c204.4-207.3,505.4,79.5,323.7,309.5C2454.9-2536.9,2287.4-2534.1,2199.4-2627.8z"
        />
        <path
          className={fill}
          stroke="#732982"
          d="M3357.8-3138.9c-218.6-110.7-144.8-428.8,102.2-428.8c193.1,0,301,221.5,176,360.6C3556.6-3116.2,3451.5-3090.6,3357.8-3138.9z"
        />
      </g>
    </svg>
  );
});
