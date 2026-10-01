import {afterEach, describe, expect, it, vi} from "vitest"
import {AnimationFrame} from "@opendaw/lib-dom"
import {installAutoScroll} from "./AutoScroll"

const documentTarget = vi.hoisted(() => new EventTarget())
vi.mock("@/ui/surface/Surface.tsx", () => ({Surface: {get: () => ({owner: {document: documentTarget}})}}))

let frame: FrameRequestCallback = () => {}
let timestamp = 0
const flush = () => frame(timestamp += 20)
const owner = {requestAnimationFrame: (callback: FrameRequestCallback) => {frame = callback; return 1},
    cancelAnimationFrame() {}} as unknown as WindowProxy

afterEach(() => AnimationFrame.terminate())

describe("edge scrolling cancellation", () => {
    it.each(["Escape", "pointercancel", "dispose"])("stops and disarms on %s", action => {
        const target = Object.assign(new EventTarget(), {
            getBoundingClientRect: () => ({left: 0, right: 49, top: 0, bottom: 49})
        })
        const scroll = vi.fn()
        const subscription = installAutoScroll(target as unknown as Element, scroll)
        AnimationFrame.start(owner)
        target.dispatchEvent(new Event("pointerdown"))
        const move = () => documentTarget.dispatchEvent(Object.assign(new Event("pointermove"), {clientX: 60, clientY: 20}))
        move()
        flush()
        expect(scroll).toHaveBeenCalledExactlyOnceWith(11, 0)
        if (action === "dispose") {
            subscription.terminate()
        } else {
            documentTarget.dispatchEvent(Object.assign(new Event(action === "Escape" ? "keydown" : action), {key: action}))
        }
        move()
        flush()
        expect(scroll).toHaveBeenCalledOnce()
        subscription.terminate()
    })
})
