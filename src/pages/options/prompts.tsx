import { defaultSetting } from "@/const";
import { SquarePen, Trash2, RotateCw, Plus, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSetting } from "@/hooks/useSetting";
import type { Prompt } from "@/types";

class FilterPointerSensor extends PointerSensor {
  static activators: typeof PointerSensor.activators = [
    {
      eventName: "onPointerDown",
      handler({ nativeEvent: event }) {
        const target = event.target as HTMLElement;
        if (target.closest(".clickable")) {
          return false;
        }
        return true;
      },
    },
  ];
}
const showModal = () => {
  (document.getElementById("modal") as HTMLDialogElement).showModal();
};
const closeModal = () => {
  (document.getElementById("modal") as HTMLDialogElement).close();
};
export default function Prompts() {
  const {setting, setSetting} = useSetting();
  const sensors = useSensors(useSensor(FilterPointerSensor));
  const [dialogItem, setDialogItem] = useState<Prompt | null>(null);
  const items = setting.prompts ?? defaultSetting.prompts;
  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item) => active.id === item.id);
      const newIndex = items.findIndex((item) => over.id === item.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      setSetting({prompts: newItems});
    }
  }
  const closeConfirm = () => {
    (document.activeElement as HTMLElement).blur();
  };
  const onAdd = () => {
    showModal();
  };
  const reset = () => {
    setSetting({prompts: defaultSetting.prompts})
  };
  const onRemove = (submitItem: Prompt) => {
    setSetting({prompts: items.filter((item) => item.id !== submitItem.id)});
  };
  const onSubmit = (submitItem: Prompt) => {
    let newItems:Prompt[] = []; 
    if (items.find((item) => submitItem.id === item.id)) {
      newItems =
        items.map((item) => {
          if (item.id !== submitItem.id) {
            return item;
          } else {
            return submitItem;
          }
        })
      
    } else {
      newItems =[...items, submitItem];
    }
    setSetting({prompts: newItems})
    closeModal();
  };
  return (
    <div>
      <div className="mt-4">
        <div className="font-semibold text-[17px] mb-3">Prompts</div>
        <div onClick={onAdd} className="btn btn-neutral btn-sm mr-2">
          <Plus className="w-[14px] h-[14px]" />
          Add
        </div>
        <div className="dropdown">
          <button tabIndex={0} role="button" className="btn btn-neutral btn-sm">
            <RotateCw className="w-[14px] h-[14px]" />
            Reset
          </button>
          <div
            tabIndex={0}
            className="dropdown-content card card-compact w-[170px] bg-base-200 text-base-content text-xs"
          >
            <div className="card-body items-center text-center">
              <p className="text-[13px]">Are you sure?</p>
              <div className="card-actions justify-end">
                <button
                  onMouseDown={closeConfirm}
                  className="btn btn-xs btn-primary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    closeConfirm();
                    reset();
                  }}
                  className="btn btn-xs btn-ghost"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <Item
              key={item.id}
              item={item}
              onEdit={() => setDialogItem(item)}
              onRemove={() => onRemove(item)}
            />
          ))}
        </SortableContext>
      </DndContext>
      <EditDialog item={dialogItem} onSubmit={onSubmit} />
    </div>
  );
}

function Item({
  item,
  onEdit,
  onRemove,
}: {
  item: Prompt;
  onRemove: () => void;
  onEdit: () => void;
}) {
  const { id, title, content } = item;
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const edit = () => {
    showModal();
    onEdit();
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-move group my-4 flex justify-between space-x-1 items-center  p-4  rounded-lg border text-sm"
    >
      <div className="w-[120px] shrink-0 border-r mr-4 whitespace-nowrap overflow-hidden text-ellipsis">
        {title}
      </div>
      <div className="flex-grow">{content}</div>
      <button
        onClick={edit}
        className="clickable mr-2 group-hover:opacity-100 opacity-0 btn btn-xs btn-square"
      >
        <SquarePen className="w-4 h-4" />
      </button>
      <button
        onClick={onRemove}
        className="clickable group-hover:opacity-100 opacity-0 btn btn-xs btn-square"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
function EditDialog({
  item,
  onSubmit,
}: {
  item: Prompt | null;
  onSubmit: (item: Prompt) => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  useEffect(() => {
    setTitle(item?.title ?? "");
    setContent(item?.content ?? "");
  }, [item]);
  return (
    <>
      <dialog id="modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="outline-none btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <div className="p-2 space-y-3">
            <div>
              <span className="inline-block mb-1 font-semibold">
                Name
              </span>
              <input
                value={title}
                onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
                id="name"
                type="text"
                className="w-full input input-bordered"
              />
            </div>
            <div>
              <span className="inline-block mb-1">
                <span className="font-semibold mr-2">Content</span>
                <div className="flex items-center gap-1">
                  <Info className="w-[12px] h-[12px] opacity-80" />
                  <span className="text-gray-500">{`You can use {selectionText} represents the selected text`}</span>
                </div>
              </span>
              <textarea
                id="content"
                value={content}
                onInput={(e) => setContent((e.target as HTMLInputElement).value)}
                className="w-full textarea textarea-bordered"
              />
            </div>
            <div className="text-right space-x-2">
              <button onClick={closeModal} className="btn">
                Cancel
              </button>
              <button
                onClick={() =>
                  onSubmit({ title, content, id: item?.id ?? Date.now() + "" })
                }
                className="btn  btn-primary"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
