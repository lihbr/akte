export const base = (
	slot: string,
	args: {
		path: string;
		title?: string;
	},
): string => {
	const docURL = "https://akte.js.org";
	const title = args.title ? `Akte - ${args.title}` : "Akte";
	const description =
		"Akte is a minimal file generator to make websites with an integrated data cascade. It integrates with Vite, has serverless capabilities, and is all nicely typed~";

	return /* html */ `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<link rel="canonical" href="${docURL}${args.path}" />
		<title>${title}</title>
		<meta name="description" content="${description}">

		<meta property="og:site_name" content="Akte">
		<meta property="og:type" content="website">
		<meta property="og:url" content="${docURL}${args.path}">

		<meta property="og:title" content="${title}">
		<meta property="og:description" content="${description}">
		<meta property="og:image" content="${docURL}/meta.png">

		<meta name="twitter:card" content="summary_large_image">
		<meta name="twitter:site" content="@li_hbr">

		<meta name="twitter:title" content="${title}">
		<meta name="twitter:description" content="${description}">
		<meta name="twitter:image" content="${docURL}/meta.png">

		<link rel="icon" type="image/x-icon" href="/favicon.ico">
		<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
		<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
		<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
		<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#e84311">
		<meta name="msapplication-TileColor" content="#e84311">
		<meta name="theme-color" content="#fff7f7">

		<link rel="stylesheet" href="/assets/css/style.css" />
	</head>
	<body>
		${slot}
		<script type="module" src="/assets/js/base.ts"></script>
	</body>
</html>`;
};
