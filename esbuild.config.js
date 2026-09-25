import esbuild from 'esbuild';
import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const isDev = process.env.NODE_ENV === 'development';

const declarations = {
  name: 'declarations',
  setup(build) {
    build.onStart(() => {
      execFileSync(
        process.execPath,
        [require.resolve('typescript/bin/tsc'), '-p', 'tsconfig.build.json'],
        { stdio: 'inherit' },
      );
    });
  },
};

const config = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'neutral',
  outdir: 'dist',
  sourcemap: isDev,
  target: ['es2022'],
  format: 'esm',
  minify: false,
  logLevel: 'info',
  plugins: [declarations],
};

try {
  rmSync(new URL('./dist', import.meta.url), { recursive: true, force: true });
  if (isDev) {
    const context = await esbuild.context(config);
    await context.watch();
  } else {
    await esbuild.build(config);
  }
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
