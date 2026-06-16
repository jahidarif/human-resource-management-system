import { useState, useEffect } from 'react';
import api from '../api/axios';

interface Config {
  firstDayOfMonth: number;
}

export function useConfig() {
  const [config, setConfig] = useState<Config>({
    firstDayOfMonth: 1,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/config')
      .then(res => setConfig(res.data))
      .catch(() => {
        setConfig({ firstDayOfMonth: 1 });
      })
      .finally(() => setLoading(false));
  }, []);

  return { config, loading };
}