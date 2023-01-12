export const basic = (slot: string): string => {
	return /* html */ `
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Akte + Vite</title>
	</head>
	<body>
		<a href="/">index</a>
		${slot}
		<script type="module" src="/assets/main.ts"></script>
	</body>
</html>`;
};
