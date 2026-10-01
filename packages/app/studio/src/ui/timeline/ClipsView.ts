import {clamp, DefaultObservableValue, int, MutableObservableValue, ObservableValue} from "@opendaw/lib-std"

export class ClipsView {
    static readonly MinColumns: int = 16
    static readonly DefaultVisible: int = 3

    readonly enabled: MutableObservableValue<boolean>

    readonly #columns: DefaultObservableValue<int>
    readonly #visible: DefaultObservableValue<int>
    readonly #scroll: DefaultObservableValue<int>

    constructor(enabled: MutableObservableValue<boolean>) {
        this.enabled = enabled
        this.#columns = new DefaultObservableValue(ClipsView.MinColumns)
        this.#visible = new DefaultObservableValue(ClipsView.DefaultVisible)
        this.#scroll = new DefaultObservableValue(0)
    }

    get columns(): ObservableValue<int> {return this.#columns}
    get visible(): ObservableValue<int> {return this.#visible}
    get scroll(): ObservableValue<int> {return this.#scroll}

    setVisible(count: int, fit: int): void {
        const max = Math.max(1, Math.min(this.#columns.getValue(), fit))
        this.#visible.setValue(clamp(count, 1, max))
        this.scrollTo(this.#scroll.getValue())
    }

    scrollTo(index: int): void {
        this.#scroll.setValue(clamp(index, 0, this.#columns.getValue() - this.#visible.getValue()))
    }

    scrollBy(delta: int): void {this.scrollTo(this.#scroll.getValue() + delta)}

    ensureColumn(index: int): void {this.#columns.setValue(Math.max(this.#columns.getValue(), index + 2))}

    reveal(index: int): void {
        const scroll = this.#scroll.getValue()
        const visible = this.#visible.getValue()
        if (index < scroll) {
            this.scrollTo(index)
        } else if (index >= scroll + visible) {
            this.scrollTo(index - visible + 1)
        }
    }

    reset(highestIndex: int): void {
        this.#columns.setValue(Math.max(ClipsView.MinColumns, highestIndex + 2))
        this.#visible.setValue(clamp(this.#visible.getValue(), 1, this.#columns.getValue()))
        this.#scroll.setValue(0)
    }
}
