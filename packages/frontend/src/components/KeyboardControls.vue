<script setup lang="ts">
import KeySimulator, { SimulatedKey } from "./KeySimulator.vue";
import UpTriangle from "./ui/icons/UpTriangle.vue";
import LeftTriangle from "./ui/icons/LeftTriangle.vue";
import DownTriangle from "./ui/icons/DownTriangle.vue";
import RightTriangle from "./ui/icons/RightTriangle.vue";
import ReturnKey from "./ui/icons/ReturnKey.vue";
import LeftArrow from "./ui/icons/LeftArrow.vue";
import Home from "./ui/icons/Home.vue";
import WindowsKey from "./ui/icons/WindowsKey.vue";
import AltKey from "./ui/icons/AltKey.vue";
import CommandKey from "./ui/icons/CommandKey.vue";
import Swap from "./ui/icons/Swap.vue";
import { useToggle } from "@vueuse/core";
import { computed } from "vue";

const [showFnKeys, toggleShowFnKeys] = useToggle(false);

const keys = computed<SimulatedKey[]>(() => {
  const fnSwap = (og: SimulatedKey, fn: SimulatedKey) =>
    showFnKeys.value ? fn : og;

  return [
    {
      render: "Shift",
      code: "ShiftLeft",
    },
    {
      render: "Ctrl",
      code: "ControlLeft",
    },
    {
      render: WindowsKey,
      code: "Windows",
    },
    {
      render: AltKey,
      code: "AltLeft",
    },
    {
      render: CommandKey,
      code: "MetaLeft",
    },
    {
      render: "Esc",
      code: "Escape",
    },
    {
      render: "Tab",
      code: "Tab",
    },
    fnSwap(
      {
        render: LeftArrow,
        code: "Back",
      },
      {
        render: "F10",
        code: "F10",
      }
    ),
    fnSwap(
      {
        render: "/",
        code: "Slash",
      },
      {
        render: "F11",
        code: "F11",
      }
    ),
    fnSwap(
      {
        render: "*",
        code: "Multiply",
      },
      {
        render: "F12",
        code: "F12",
      }
    ),
    {
      render: "-",
      code: "Subtract",
    },
    {
      render: "Ins",
      code: "Insert",
    },
    {
      render: Home,
      code: "Home",
    },
    {
      render: "PgUp",
      code: "PageUp",
    },
    fnSwap(
      {
        render: "7",
        code: "Digit7",
      },
      {
        render: "F7",
        code: "F7",
      }
    ),
    fnSwap(
      {
        render: "8",
        code: "Digit8",
      },
      {
        render: "F8",
        code: "F8",
      }
    ),
    fnSwap(
      {
        render: "9",
        code: "Digit9",
      },
      {
        render: "F9",
        code: "F9",
      }
    ),
    {
      render: "+",
      code: "Add",
    },
    {
      render: "Del",
      code: "Delete",
    },
    {
      render: "End",
      code: "End",
    },
    {
      render: "PgDn",
      code: "PageDown",
    },
    fnSwap(
      {
        render: "4",
        code: "Digit4",
      },
      {
        render: "F4",
        code: "F4",
      }
    ),
    fnSwap(
      {
        render: "5",
        code: "Digit5",
      },
      {
        render: "F5",
        code: "F5",
      }
    ),
    fnSwap(
      {
        render: "6",
        code: "Digit6",
      },
      {
        render: "F6",
        code: "F6",
      }
    ),
    {
      render: "=",
      code: "Equal",
    },
    {
      render: UpTriangle,
      code: "ArrowUp",
    },
    fnSwap(
      {
        render: "1",
        code: "Digit1",
      },
      {
        render: "F1",
        code: "F1",
      }
    ),
    fnSwap(
      {
        render: "2",
        code: "Digit2",
      },
      {
        render: "F2",
        code: "F2",
      }
    ),
    fnSwap(
      {
        render: "3",
        code: "Digit3",
      },
      {
        render: "F3",
        code: "F3",
      }
    ),
    {
      render: ReturnKey,
      code: "Enter",
    },
    {
      render: LeftTriangle,
      code: "ArrowLeft",
    },
    {
      render: DownTriangle,
      code: "ArrowDown",
    },
    {
      render: RightTriangle,
      code: "ArrowRight",
    },
    {
      render: "0",
      code: "Digit0",
    },
    {
      render: ".",
      code: "Period",
    },
  ];
});

const explicitGridClasses: Record<string, string> = {
  Digit0: "col-span-2",
  Enter: "row-span-2",
};
</script>

<template>
  <div class="flex justify-center items-center">
    <div class="grid grid-cols-7 grid-rows-6 gap-2">
      <KeySimulator
        v-for="key in keys"
        :value="key"
        type="keyboard"
        :class="[explicitGridClasses[key.code]]"
      />
      <button
        variant="ghost"
        :class="[
          'col-start-3 row-start-2 text-xs flex justify-center items-center bg-gray-900 border border-gray-500 rounded',
          { 'bg-secondary': showFnKeys },
        ]"
        @click="toggleShowFnKeys()"
      >
        <Swap />
      </button>
      <div class="col-start-1 row-start-5">
        <!-- Empty space left of up arrow -->
      </div>
      <div class="co col-start-3 row-start-5">
        <!-- Empty space right of up arrow -->
      </div>
      <div class="co col-start-6 row-start-1"></div>
      <div class="co col-start-7 row-start-1"></div>
    </div>
  </div>
</template>
