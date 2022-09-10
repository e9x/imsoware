import type { JsMinifyOptions } from '@swc/core';
import './env.js';
import { envRawHash, envRawStringified } from './env.js';
import type swcrcSchema from './swcrc.js';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { resolve } from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import type { Configuration } from 'webpack';
import webpack from 'webpack';
import type { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';

declare module 'webpack' {
	interface Configuration {
		devServer?: WebpackDevServerConfiguration;
	}
}

const emitErrorsAsWarnings = process.env.ESLINT_NO_DEV_ERRORS === 'true';

const isDevelopment = process.env.NODE_ENV !== 'production';

type ArrElement<ArrType> = ArrType extends readonly (infer ElementType)[]
	? ElementType
	: never;

type PluginEntry = ArrElement<Required<Configuration>['plugins']>;

const config: Configuration = {
	devServer: {
		hot: false,
		liveReload: false,
		static: resolve('dist'),
		allowedHosts: ['krunker.io'],
		client: { webSocketURL: 'ws://localhost:3000/ws' },
		headers: {
			'access-control-allow-headers': '*',
			'access-control-allow-origin': '*',
			'access-control-allow-methods': '*',
			'access-control-expose-headers': '*',
			'access-control-max-age': '7200',
		},
		compress: false,
		port: 3000,
	},
	entry: './src/index.ts',
	target: 'web',
	output: {
		filename: 'main.js',
		path: resolve('dist'),
		publicPath: '/',
		// Krunker's frontend depends on other webpack libraries
		uniqueName: 'imsoware',
	},
	devtool: isDevelopment ? 'eval-source-map' : 'source-map',
	mode: isDevelopment ? 'development' : 'production',
	module: {
		rules: [
			{
				oneOf: [
					// Process application JS with SWC.
					// The preset includes JSX, Flow, TypeScript, and some ESnext features.
					{
						test: /\.[mc]?[jt]sx?$/,
						include: resolve('src'),
						loader: 'swc-loader',
						options: {
							sourceMaps: true,
							minify: !isDevelopment,
							jsc: {
								parser: {
									syntax: 'typescript',
									tsx: true,
									decorators: false,
									dynamicImport: true,
								},
								transform: {
									react: {
										runtime: 'automatic',
									},
								},
								target: 'es2015',
								externalHelpers: true,
							},
						} as swcrcSchema,
					},
					// Process any JS outside of the app with SWC.
					// Unlike the application JS, we only compile the standard ES features.
					{
						test: /\.(js|mjs)$/,
						exclude: /@swc(?:\/|\\{1,2})helpers/,
						loader: 'swc-loader',
						options: {
							minify: !isDevelopment,
							sourceMaps: true,
							jsc: {
								target: 'es2015',
								externalHelpers: true,
							},
						} as swcrcSchema,
					},
				],
			},
		],
	},
	cache: {
		type: 'filesystem',
		version: envRawHash,
		cacheDirectory: resolve('node_modules/.cache'),
		store: 'pack',
		buildDependencies: {
			defaultWebpack: ['webpack/lib/'],
			config: [resolve('webpack.config.ts')],
			tsconfig: [resolve('tsconfig.json')],
		},
	},
	resolve: {
		extensions: ['.mjs', '.js', '.ts', '.tsx', '.json', '.jsx'],
	},
	optimization: {
		minimize: !isDevelopment,
		minimizer: [
			new TerserPlugin<JsMinifyOptions>({
				minify: TerserPlugin.swcMinify,
			}),
		],
	},
	plugins: (
		[
			new webpack.optimize.LimitChunkCountPlugin({
				maxChunks: 1,
			}),
			new webpack.DefinePlugin({
				'process.env': envRawStringified,
			}),
			new ForkTsCheckerWebpackPlugin(),
			new ESLintPlugin({
				// Plugin options
				extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'],
				eslintPath: 'eslint',
				failOnError: !(isDevelopment && emitErrorsAsWarnings),
				cache: true,
				cacheLocation: resolve('node_modules/.cache/.eslintcache'),
			}),
			isDevelopment && new CaseSensitivePathsPlugin(),
		] as (PluginEntry | false)[] as PluginEntry[]
	).filter(Boolean),
};

export default config;
