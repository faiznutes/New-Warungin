import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

const errorRate = new Rate("errors");

export const options = {
  stages: [
    { duration: "30s", target: 50 },
    { duration: "1m", target: 50 },
    { duration: "30s", target: 100 },
    { duration: "1m", target: 100 },
    { duration: "30s", target: 200 },
    { duration: "1m", target: 200 },
    { duration: "30s", target: 500 },
    { duration: "2m", target: 500 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<300", "p(99)<1000"],
    http_req_failed: ["rate<0.01"],
    errors: ["rate<0.01"],
  },
};

const BASE_URL = "http://192.168.1.101";

export default function () {
  // Health check
  let res = http.get(BASE_URL + "/health");
  check(res, {
    "health check status is 200": (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);

  // API health check
  res = http.get(BASE_URL + "/api/health");
  check(res, {
    "API health status is 200": (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);

  // Simulate product listing (common operation)
  res = http.get(BASE_URL + "/api/products?page=1&limit=20", {
    headers: {
      "Authorization": "Bearer test-token", // Note: This will fail auth but tests endpoint availability
    },
  });
  check(res, {
    "products endpoint responds": (r) => r.status === 200 || r.status === 401, // 401 is expected without valid token
  }) || errorRate.add(1);

  sleep(2);
}
