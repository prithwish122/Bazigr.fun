import { useRef } from "react";

type UseAutoResizeTextareaOptions = { minHeight?: number; maxHeight?: number; };


export function useAutoResizeTextarea(options: UseAutoResizeTextareaOptions = {}) {
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const { minHeight = 52, maxHeight = 200 } = options;

	const adjustHeight = () => {
		const textarea = textareaRef.current;
		if (!textarea) return;
		textarea.style.height = "auto";
		let newHeight = textarea.scrollHeight;
		if (minHeight) newHeight = Math.max(newHeight, minHeight);
		if (maxHeight) newHeight = Math.min(newHeight, maxHeight);
		textarea.style.height = `${newHeight}px`;
	};

	return { textareaRef, adjustHeight };
}

