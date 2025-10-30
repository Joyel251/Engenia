/** @type {import('next').NextConfig} */
const nextConfig = {
	eslint: {
		// Don't block production builds on lint errors
		ignoreDuringBuilds: true,
	},
	output: undefined, // ensure we're not doing a static export inadvertently
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'drive.google.com',
			},
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
			},
			{
				protocol: 'https',
				hostname: 'drive.usercontent.google.com',
			},
			{
				protocol: 'https',
				hostname: '*.googleusercontent.com',
			},
		],
		// Allow unoptimized images for Google Drive
		unoptimized: false,
	},
};

export default nextConfig;
