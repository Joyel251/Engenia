/** @type {import('next').NextConfig} */
const nextConfig = {
	eslint: {
		// Don't block production builds on lint errors
		ignoreDuringBuilds: true,
	},
	output: undefined, // ensure we're not doing a static export inadvertently
};

export default nextConfig;
