export const pkceMetrics = new Prometheus.Gauge({
  name: 'pkce_verification_attempts',
  help: 'PKCE code verification attempts',
  labelNames: ['result']
});

export const trackPKCEValidation = (success: boolean) => {
  pkceMetrics.labels(success ? 'success' : 'failure').inc();
};

// Example usage in token endpoint
trackPKCEValidation(true);
