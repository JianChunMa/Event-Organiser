export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    fontFamily: { pixel: ['"Press Start 2P"', 'monospace'], term: ['VT323', 'monospace'] },
    colors: { crt: '#0d0221', panel: '#1a1040', neon: '#00ffd5', hot: '#ff2e97', gold: '#ffe14d', mute: '#9d8fd1' },
    boxShadow: { px: '4px 4px 0 #000', pxl: '6px 6px 0 #000' },
  } },
};
