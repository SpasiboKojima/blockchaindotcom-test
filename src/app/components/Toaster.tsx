import { create } from 'zustand';

interface ToasterState {
	error: string;
	isHiding: boolean;
	toast: (error: string) => void;
}

export const useToaster = create<ToasterState>()((set) => ({
	error: '',
	isHiding: false,
	toast: (error) => {
		set({ error });

		setTimeout(() => {
			set({ isHiding: true });
		}, 5000);
		setTimeout(() => {
			set({ error: '', isHiding: false });
		}, 7000);
	},
}));

export const Toaster = () => {
	const error = useToaster((state) => state.error);
	const isHiding = useToaster((state) => state.isHiding);

	return (
		error && (
			<div className={`toast ${isHiding ? 'translate-y-full transition-transform' : ''}`}>
				<div className="alert alert-error text-primary-content">
					<span>{error}</span>
				</div>
			</div>
		)
	);
};
