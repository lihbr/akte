module.exports = {
	plugins: {
		"postcss-import": {},
		"autoprefixer": process.env.NODE_ENV === "production" ? {} : false,
		"cssnano": process.env.NODE_ENV === "production" ? {} : false,
	},
};
