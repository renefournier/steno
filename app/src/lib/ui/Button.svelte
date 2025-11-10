<script lang="ts">
	export let variant: 'primary' | 'secondary' | 'danger' | 'success' | 'link' = 'primary';
	export let size: 'small' | 'normal' | 'medium' | 'large' = 'normal';
	export let disabled: boolean = false;
	export let active: boolean = false;
	export let type: 'button' | 'submit' | 'reset' = 'button';
</script>

<button
	class="button is-{variant} is-{size}"
	class:is-active={active}
	class:is-disabled={disabled}
	{disabled}
	{type}
	on:click
>
	<slot />
</button>

<style>
	.button {
		transition: all 0.2s ease;
		font-weight: 500;
		border: 1px solid transparent;
		position: relative;
	}

	/* Normal state - subtle appearance with link color */
	.button {
		color: var(--link-color, #3273dc);
		background: transparent;
		border-color: #dbdbdb;
	}

	/* Hover - lift and zoom with shadow */
	.button:hover:not(:disabled):not(.is-disabled) {
		transform: translateY(-2px) scale(1.02);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		color: var(--link-color, #3273dc);
		text-shadow: 0 0 8px rgba(50, 115, 220, 0.3);
	}

	/* Active (click) - depressed inset shadow */
	.button:active:not(:disabled):not(.is-disabled) {
		transform: translateY(1px) scale(0.98);
		box-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.2);
		text-shadow: none;
	}

	/* Selected state - slightly depressed with subtle glow */
	.button.is-active:not(:disabled) {
		transform: translateY(1px);
		box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.15);
		color: var(--link-color, #3273dc);
		text-shadow: 0 0 10px rgba(50, 115, 220, 0.4);
		background: rgba(50, 115, 220, 0.05);
	}

	/* Disabled state */
	.button:disabled,
	.button.is-disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
		text-shadow: none;
	}

	/* Variant colors */
	.button.is-primary {
		border-color: #3273dc;
	}

	.button.is-secondary {
		color: #666;
		border-color: #dbdbdb;
	}

	.button.is-danger {
		color: #f14668;
		border-color: #f14668;
	}

	.button.is-danger:hover:not(:disabled) {
		text-shadow: 0 0 8px rgba(241, 70, 104, 0.3);
	}

	.button.is-success {
		color: #48c774;
		border-color: #48c774;
	}

	.button.is-success:hover:not(:disabled) {
		text-shadow: 0 0 8px rgba(72, 199, 116, 0.3);
	}

	.button.is-link {
		border: none;
		padding: 0.5rem 0.75rem;
	}
</style>
