
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Store } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../api/axios";
import { getStoreUrl } from "../utils/storeUrl";

function CreateStore() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    storeName: "",
    storeSlug: "",
  });

  const [createdStore, setCreatedStore] = useState(null);
  const [existingStore, setExistingStore] = useState(null);

  const [checkingStore, setCheckingStore] = useState(true);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState(null);
  const [saving, setSaving] = useState(false);


  const submittingRef = useRef(false);


  const update = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));


    if (name === "storeSlug") {
      setSlugAvailable(null);
    }
  };


  useEffect(() => {
    let active = true;

    const fetchMyStore = async () => {
      try {
        setCheckingStore(true);

        const response = await api.get("/dropshippers/me");

        if (!active) return;

        const store =
          response.data?.store ||
          response.data?.data?.store ||
          null;

        setExistingStore(store);
      } catch (error) {
        console.error(
          "GET MY STORE ERROR:",
          error.response?.status,
          error.response?.data || error.message
        );

        if (active) {

          setExistingStore(null);
        }
      } finally {
        if (active) {
          setCheckingStore(false);
        }
      }
    };

    fetchMyStore();

    return () => {
      active = false;
    };
  }, []);


  const checkSlug = async () => {
    const slug = form.storeSlug.trim();

    if (!slug) {
      setSlugAvailable(null);
      return;
    }

    try {
      setCheckingSlug(true);
      setSlugAvailable(null);

      const response = await api.get(
        `/dropshippers/check-slug/${encodeURIComponent(slug)}`
      );

      const available =
        response.data?.available ??
        response.data?.data?.available;

      setSlugAvailable(available === true);
    } catch (error) {
      console.error(
        "CHECK SLUG ERROR:",
        error.response?.status,
        error.response?.data || error.message
      );


      if (error.response?.status === 409) {
        setSlugAvailable(false);
      } else {
        setSlugAvailable(null);
      }
    } finally {
      setCheckingSlug(false);
    }
  };


  const submit = async (event) => {
    event.preventDefault();


    if (submittingRef.current || saving) {
      return;
    }

    if (checkingStore) {
      toast.error("Please wait while we check your store");
      return;
    }


    if (existingStore) {
      toast("You already have a store");
      navigate("/store-dashboard");
      return;
    }

    if (checkingSlug) {
      toast.error("Please wait while the slug is being checked");
      return;
    }

    if (slugAvailable !== true) {
      toast.error("Please choose an available store slug");
      return;
    }

    const payload = {
      username: form.username.trim(),
      storeName: form.storeName.trim(),
      storeSlug: form.storeSlug.trim().toLowerCase(),
    };

    if (
      !payload.username ||
      !payload.storeName ||
      !payload.storeSlug
    ) {
      toast.error("Please fill all fields");
      return;
    }

    submittingRef.current = true;
    setSaving(true);

    try {
      console.log("CREATE STORE REQUEST:", payload);

      const response = await api.post(
        "/dropshippers/create",
        payload
      );

      console.log(
        "CREATE STORE RESPONSE:",
        response.data
      );

      const store =
        response.data?.store ||
        response.data?.data?.store ||
        response.data?.data ||
        null;


      if (response.data?.existing === true && store) {
        setExistingStore(store);

        toast.success("Your existing store is ready");

        navigate("/store-dashboard", {
          replace: true,
        });

        return;
      }

      if (!store) {
        throw new Error(
          response.data?.message ||
            "Store data was not returned by server"
        );
      }


      setCreatedStore(store);

      toast.success("Store created successfully");
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;

      console.error(
        "CREATE STORE ERROR:",
        status,
        data || error.message
      );


      if (status === 409) {

        try {
          const lookupResponse = await api.get(
            "/dropshippers/me"
          );

          const store =
            lookupResponse.data?.store ||
            lookupResponse.data?.data?.store ||
            null;

          if (store) {
            setExistingStore(store);

            toast.success(
              "Your store already exists. Opening dashboard."
            );

            navigate("/store-dashboard", {
              replace: true,
            });

            return;
          }
        } catch (lookupError) {
          console.error(
            "STORE LOOKUP AFTER CONFLICT ERROR:",
            lookupError.response?.status,
            lookupError.response?.data ||
              lookupError.message
          );
        }


        if (
          data?.code === "SLUG_TAKEN" ||
          data?.field === "storeSlug" ||
          data?.field === "slug"
        ) {
          setSlugAvailable(false);

          toast.error(
            data?.message ||
              "This store slug is already in use"
          );

          return;
        }

        toast.error(
          data?.message ||
            "A store with these details already exists"
        );

        return;
      }

      const message =
        data?.message ||
        error.message ||
        "Unable to create store";

      toast.error(message);
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  };


  if (checkingStore) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center px-4">
        <p className="font-semibold text-gray-500">
          Checking your store...
        </p>
      </main>
    );
  }


  if (existingStore && !createdStore) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <Store
          className="mx-auto mb-4 text-blue-600"
          size={42}
        />

        <h1 className="text-3xl font-black">
          You already have a store
        </h1>

        <p className="mt-3 text-gray-500">
          {existingStore.storeName}
        </p>

        <a
          className="mt-5 inline-block font-bold text-blue-600 underline"
          href={getStoreUrl(existingStore.storeSlug)}
          target="_blank"
          rel="noreferrer"
        >
          {getStoreUrl(existingStore.storeSlug)}
        </a>

        <div className="mt-8 flex justify-center gap-3">
          <Link
            className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white"
            to="/store-dashboard"
          >
            Open dashboard
          </Link>

          <Link
            className="rounded-xl border px-5 py-3 font-bold"
            to={`/store/${existingStore.storeSlug}`}
          >
            View store
          </Link>
        </div>
      </main>
    );
  }


  if (createdStore) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Store
          className="mx-auto mb-4 text-blue-600"
          size={42}
        />

        <h1 className="text-3xl font-black">
          Your Store
        </h1>

        <p className="mt-3 text-gray-500">
          {createdStore.storeName}
        </p>

        <a
          className="mt-5 inline-block font-bold text-blue-600 underline"
          href={getStoreUrl(createdStore.storeSlug)}
          target="_blank"
          rel="noreferrer"
        >
          {getStoreUrl(createdStore.storeSlug)}
        </a>

        <div className="mt-8 flex justify-center gap-3">
          <Link
            className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white"
            to="/store-dashboard"
          >
            Open dashboard
          </Link>

          <Link
            className="rounded-xl border px-5 py-3 font-bold"
            to={`/store/${createdStore.storeSlug}`}
          >
            View store
          </Link>
        </div>
      </main>
    );
  }


  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <div className="mb-8">
        <p className="font-bold text-blue-600">
          Dropshipper setup
        </p>

        <h1 className="mt-2 text-3xl font-black">
          Create your store
        </h1>

        <p className="mt-2 text-gray-500">
          Choose the identity customers will see at your public store URL.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm"
      >
        <input
          required
          name="username"
          value={form.username}
          onChange={update}
          placeholder="Username"
          className="h-12 w-full rounded-xl border px-4"
        />

        <input
          required
          name="storeName"
          value={form.storeName}
          onChange={update}
          placeholder="Store name"
          className="h-12 w-full rounded-xl border px-4"
        />

        <div>
          <input
            required
            name="storeSlug"
            value={form.storeSlug}
            onChange={update}
            onBlur={checkSlug}
            placeholder="Store slug, e.g. rahul-store"
            className="h-12 w-full rounded-xl border px-4"
          />

          {checkingSlug && (
            <p className="mt-1 text-xs text-gray-500">
              Checking slug...
            </p>
          )}

          {slugAvailable === true && (
            <p className="mt-1 text-xs font-bold text-green-600">
              Slug is available
            </p>
          )}

          {slugAvailable === false && (
            <p className="mt-1 text-xs font-bold text-red-600">
              Slug is already in use
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={
            saving ||
            checkingStore ||
            checkingSlug ||
            slugAvailable !== true
          }
          className="h-12 w-full rounded-xl bg-blue-600 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving
            ? "Creating..."
            : checkingSlug
            ? "Checking slug..."
            : "Create store"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mt-5 text-sm font-bold text-gray-500"
      >
        Go back
      </button>
    </main>
  );
}

export default CreateStore;
