import { Link, useRouter } from "@tanstack/react-router";
import { FileQuestionIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";

type NotFoundPageProps = {
	title?: string;
	description?: string;
	homeTo?: string;
};

export function NotFoundPage({
	title = "Page not found",
	description = "We couldn’t find the page you’re looking for.",
	homeTo = "/",
}: NotFoundPageProps) {
	const router = useRouter();

	return (
		<div className="app-container flex flex-1 items-center justify-center px-4 py-10">
			<Empty className="w-full max-w-2xl">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<FileQuestionIcon className="size-4" />
					</EmptyMedia>
					<EmptyTitle className="text-base">{title}</EmptyTitle>
					<EmptyDescription>{description}</EmptyDescription>
				</EmptyHeader>

				<EmptyContent>
					<div className="flex flex-wrap items-center justify-center gap-2">
						<Button variant="outline" onClick={() => router.history.back()}>
							Go back
						</Button>
						<Button render={<Link to={homeTo} />}>Go home</Button>
					</div>
				</EmptyContent>
			</Empty>
		</div>
	);
}
