import Plausible from "plausible-tracker";

const plausible = Plausible({
	domain: "akte.js.org",
	trackLocalhost: true,
	apiHost: "https://akte.js.org/p7e",
});

type Event<
	TType = string,
	TProps extends Record<string, string | number | boolean> | void = void,
> = TProps extends void
	? {
			event: TType;
			props?: Record<string, never>;
			data?: Record<string, unknown>;
	  }
	: {
			event: TType;
			props: TProps;
			data?: Record<string, unknown>;
	  };

type PageViewEvent = Event<"pageView">;
type OutboundLinkClickEvent = Event<"outboundLink:click", { url: string }>;

type TrackEventArgs = PageViewEvent | OutboundLinkClickEvent;

const MachineToHumanEventTypes: Record<TrackEventArgs["event"], string> = {
	"pageView": "pageview",
	"outboundLink:click": "Outbound Link: Click",
};

const trackEvent = (args: TrackEventArgs): Promise<void> => {
	return new Promise((resolve) => {
		plausible.trackEvent(
			MachineToHumanEventTypes[args.event],
			{
				callback: resolve,
				props: args.props,
			},
			args.data,
		);
	});
};

// Page view
if (location.host !== "akte.js.org") {
	// Welcome page
	if (document.title.toLowerCase().includes("welcome")) {
		trackEvent({
			event: "pageView",
			data: {
				url: "https://akte.js.org/welcome",
				domain: "akte.js.org",
			},
		});
	}
} else {
	// Documentation
	trackEvent({ event: "pageView" });
}

// Outbound links (using custom solution because Plausible implementation has issues)
document.querySelectorAll("a").forEach((node) => {
	if (node.host !== location.host) {
		const trackOutboundLink = (event: MouseEvent) => {
			trackEvent({
				event: "outboundLink:click",
				props: { url: node.href },
			});

			if (!node.target) {
				event.preventDefault();
				setTimeout(() => {
					location.href = node.href;
				}, 150);
			}
		};
		node.addEventListener("click", trackOutboundLink);
		node.addEventListener("auxclick", (event) => {
			if (event.button === 1) {
				trackOutboundLink(event);
			}
		});
	}
});
