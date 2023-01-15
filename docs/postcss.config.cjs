module.exports = {
	plugins: {
		"postcss-import": {},
		"postcss-nesting": {},
		"autoprefixer": process.env.NODE_ENV === "production" ? {} : false,
		"cssnano": process.env.NODE_ENV === "production" ? {} : false,
	},
};
